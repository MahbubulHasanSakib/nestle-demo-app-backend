import { Injectable } from '@nestjs/common';
import { Execution } from './schema/execution.schema';
import { CreateExecutionDto } from './dto/create-execution.dto';
import mongoose, { Model, PipelineStage, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from '../user/interfaces/user.interface';
import { Attendance } from '../attendance/schema/attendance.schema';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Town } from '../data-management/town/schema/town.schema';
import { Outlet } from '../outlet/schema/outlet.schema';
import * as dayjs from 'dayjs';
import { dataManagementFilter } from 'src/utils/data-management-filter';
import { Material } from '../material/schema/material.schema';
import * as haversine from 'haversine-distance';
import { ExecutionProcessor } from '../ai-report/processor/execution.processor';
import { FindSalesReportDto } from './dto/find-sales-report.dto';
import { startAndEndOfDate } from 'src/utils/utils';
import { OutletFilterDto } from '../outlet/dto/outlet-filter.dto';

@Injectable()
export class ExecutionService {
  constructor(
    @InjectModel(Execution.name)
    private readonly executionModel: Model<Execution>,
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>,
    @InjectModel(Town.name)
    private readonly townModel: Model<Town>,
    @InjectModel(Outlet.name)
    private readonly outletModel: Model<Outlet>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<Material>,
    @InjectQueue('execution-image') private executionImageQueue: Queue,
    private readonly executionProcessor: ExecutionProcessor,
  ) {}
  async create(CreateExecutionDto: CreateExecutionDto, user: IUser) {
    //console.log(JSON.stringify(CreateExecutionDto, null, 4));
    const { outlet, ...rest } = CreateExecutionDto;
    const userInfo = {
      id: user._id,
      name: user.name,
      usercode: user.usercode,
      userType: user.kind,
    };

    if (outlet.lat && outlet.lon && rest.lat && rest.lon) {
      const a = { lat: outlet.lat, lon: outlet.lon };
      const b = { lat: rest.lat, lon: rest.lon };

      rest.distance = +haversine(a, b).toFixed(2);
      rest.withinRadius = rest.distance <= 50;
    }

    const execution: any = await this.executionModel.create({
      user: userInfo,
      outlet,
      ...rest,
    });
    await execution.save();
    await this.outletModel.updateOne(
      { _id: outlet.id },
      {
        $set: {
          lastVisitedAt: execution.createdAt,
          lastOrderAmount: execution.totalOrderedAmount,
          lastOrderDelivered: false,
          lastOrderId: execution._id,
        },
      },
    );
    return {
      data: execution,
    };
  }

  async findSalesReport(query: FindSalesReportDto) {
    const {
      regionId,
      areaId,
      territoryId,
      townId,
      userId,
      orderStatus,
      deliveryStatus,
      searchTerm,
      page: pageNo,
      limit: pageLimit,
      from,
      to,
    } = query;

    const page = Number(pageNo) > 0 ? Number(pageNo) : 1;
    const limit = Number(pageLimit) > 0 ? Number(pageLimit) : 20;
    const skip = (page - 1) * pageLimit;

    let townQuery: any = {};
    const filter: any = {};

    const { startOfToday, endOfToday } = startAndEndOfDate(new Date());
    let dayQuery: any = {
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    };

    if (
      regionId?.length > 0 ||
      areaId?.length > 0 ||
      territoryId?.length > 0 ||
      townId?.length > 0
    ) {
      townQuery = dataManagementFilter(regionId, areaId, territoryId, townId);
      const result = await this.townModel.aggregate([
        { $match: townQuery },
        {
          $group: {
            _id: null,
            town: { $push: '$_id' },
          },
        },
      ]);

      if (result[0]?.town) {
        townQuery = { townId: { $in: result[0]?.town } };
      }
    }

    if (userId?.length > 0)
      filter['user.id'] = { $in: userId.map((v) => new Types.ObjectId(v)) };
    // if (orderStatus) filter['orderStatus'] = orderStatus;
    if (deliveryStatus) filter['paymentMethod'] = deliveryStatus;

    if (searchTerm) {
      filter['$or'] = [
        { 'outlet.name': { $regex: searchTerm, $options: 'i' } },
        { 'outlet.code': { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (from) {
      const { startOfToday: startDate } = startAndEndOfDate(from);
      dayQuery = {
        createdAt: {
          ...dayQuery.createdAt,
          $gte: startDate,
        },
      };
    }

    if (to) {
      const { endOfToday: endDate } = startAndEndOfDate(to);
      dayQuery = {
        createdAt: {
          ...dayQuery.createdAt,
          $lte: endDate,
        },
      };
    }

    const pipeline: PipelineStage[] = [
      {
        $match: {
          ...filter,
          ...townQuery,
          ...dayQuery,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          data: [
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
          meta: [
            {
              $count: 'total',
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$meta',
        },
      },
    ];

    const [{ data = [], meta = {} } = {}] =
      await this.executionModel.aggregate(pipeline);

    return {
      data,
      meta: { ...meta, limit, page },
    };
  }

  async memoByExecution(dto: OutletFilterDto, user: IUser) {
    let towns = await this.townModel.aggregate([
      { $match: { _id: { $in: user.town.map((id) => id) }, deletedAt: null } },
      {
        $project: {
          _id: 0,
          label: '$name',
          value: '$_id',
        },
      },
    ]);
    let routes = await this.outletModel.aggregate([
      {
        $match: {
          deletedAt: null,
          'town.id': {
            $in: user.town,
          },
        },
      },
      {
        $group: {
          _id: {
            townId: '$town.id',
            routeName: '$route.name',
          },
        },
      },
      {
        $project: {
          _id: 0,
          townId: '$_id.townId',
          label: '$_id.routeName',
          value: '$_id.routeName',
        },
      },
      { $sort: { label: 1 } },
    ]);
    let executions = [];
    if (dto.townId && dto.route) {
      let outletFilter = {};
      if (dto.outletcode) {
        outletFilter['outlet.outletcode'] = dto.outletcode;
      }
      executions = await this.executionModel.aggregate([
        {
          $match: {
            deletedAt: null,
            'town.id': new Types.ObjectId(dto.townId),
            'user.id': user._id,
            'outlet.route': dto.route,
            ...outletFilter,
          },
        },
        {
          $project: {
            outlet: 1,
            createdAt: 1,
            totalOrderedAmount: 1,
            orderItems: 1,
            exchangeItems: 1,
            returnItems: 1,
          },
        },
      ]);
    }

    return {
      data: {
        towns,
        routes,
        executions,
      },
    };
  }

  async deliverProduct(id: string) {
    const execution = await this.executionModel.findById(id);
    if (!execution) {
      throw new Error('Execution not found');
    }
    const updateExecution = await this.executionModel.findByIdAndUpdate(id, {
      $set: { delivered: true },
    });
    if (!updateExecution) {
      throw new Error('Error occurred while updating execution for delivery');
    }
    return {
      data: updateExecution,
      message: 'Sale marked as delivered successfully',
    };
  }

  async findById(id: string) {
    const execution = await this.executionModel.findById(id);
    if (!execution) {
      throw new Error('Execution not found');
    }
    return { data: execution };
  }
}
