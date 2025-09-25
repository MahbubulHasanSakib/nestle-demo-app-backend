import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Execution } from './schema/execution.schema';
import { CreateExecutionDto } from './dto/create-execution.dto';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from '../user/interfaces/user.interface';
import { ImageKind } from './interface/image-kind.type';
import { JobType } from './interface/job.type';
import { ExecutionCallType } from './interface/execution-call.type';
import { Attendance } from '../attendance/schema/attendance.schema';
import {
  getItemType,
  startAndEndBetweenSixDays,
  startAndEndOfDate,
  weekOfMonth,
} from 'src/utils/utils';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { UserType } from '../user/interfaces/user.type';
import { GetVisitCallReportDto } from './dto/get-visit-call-report.dto';
import { Town } from '../data-management/town/schema/town.schema';
import { Outlet } from '../outlet/schema/outlet.schema';
import { StatusType } from './interface/status.type';
import * as dayjs from 'dayjs';
import { dataManagementFilter } from 'src/utils/data-management-filter';
import { ObjectId } from 'mongodb';
import { Material } from '../material/schema/material.schema';
import * as haversine from 'haversine-distance';
import { ExecutionProcessor } from '../ai-report/processor/execution.processor';
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
}
