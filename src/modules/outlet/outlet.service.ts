import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Outlet } from './schema/outlet.schema';
import { OutletRepository } from './outlet.repository';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { Constants } from 'src/utils/constants';
import { ResponseUtils } from 'src/utils/response.utils';
import { IUser } from '../user/interfaces/user.interface';
import { startAndEndOfDate, tz } from 'src/utils/utils';
import { JobType } from '../execution/interface/job.type';
import { PaginateDto } from 'src/utils/dto/paginate.dto';
import { Route } from '../route/schema/route.schema';
import { Town } from '../data-management/town/schema/town.schema';
import { GetRoutesOutlets } from './dto/get-routes-outlets.dto';
import * as dayjs from 'dayjs';
import { UserType } from '../user/interfaces/user.type';
import { OutletFilterDto } from './dto/outlet-filter.dto';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class OutletService {
  constructor(
    @InjectModel('Outlet') private readonly OutletModel: Model<Outlet>,
    @InjectModel(Route.name) private readonly routeModel: Model<Route>,
    @InjectModel(Town.name) private readonly townModel: Model<Town>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private readonly outletRepository = new OutletRepository(this.OutletModel);

  async create(dto: CreateOutletDto): Promise<any> {
    try {
      const data = await this.outletRepository.createEntity(dto);
      if (!data) {
        throw new BadRequestException(Constants.CREATE_FAILED);
      }
      return ResponseUtils.successResponseHandler(
        201,
        'Successfully created data',
        'data',
        data,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async update(id: string, dto: UpdateOutletDto): Promise<any> {
    try {
      const data = await this.outletRepository.updateEntity(id, dto);
      if (!data) {
        throw new NotFoundException(Constants.NOT_FOUND);
      }
      return ResponseUtils.successResponseHandler(
        200,
        'Successfully updated data',
        'data',
        data,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getById(id: string): Promise<any> {
    try {
      const data = await this.outletRepository.getEntityById(id);
      if (!data) {
        throw new NotFoundException(Constants.NOT_FOUND);
      }
      return ResponseUtils.successResponseHandler(
        200,
        'Successfully retrieved data',
        'data',
        data,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getAll(query: any, page?: number, limit?: number): Promise<any> {
    const filterQuery: Record<string, any> = {};

    Object.keys(query).forEach((key) => {
      filterQuery[key] = query[key];
    });

    const skip = page && limit ? (page - 1) * limit : 0;
    const effectiveLimit = limit || 10;

    try {
      const data = await this.outletRepository.getAllEntities(
        filterQuery,
        skip,
        effectiveLimit,
      );
      return ResponseUtils.successResponseHandler(
        200,
        'Successfully retrieved data',
        'data',
        data,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async delete(id: string): Promise<any> {
    try {
      const result = await this.outletRepository.deleteEntity(id);
      if (!result) {
        throw new NotFoundException(Constants.NOT_FOUND);
      }
      return ResponseUtils.successResponseHandler(
        200,
        'Successfully deleted data',
        'deleted',
        true,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async outletList(dto: OutletFilterDto, user: IUser) {
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
    let routes = await this.OutletModel.aggregate([
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

    let outlets = [];
    let cms = [];

    if (dto.townId && dto.route) {
      let outletFilter = {};
      if (dto.outletcode) {
        outletFilter['outletcode'] = dto.outletcode;
      }

      cms = await this.userModel.aggregate([
        {
          $match: {
            username: { $exists: true },
            _id: { $ne: user._id },
            kind: UserType.CM,
            town: { $in: user.town },
            deletedAt: null,
          },
        },
        {
          $project: {
            _id: 0,
            label: '$name',
            value: '$_id',
            usercode: 1,
          },
        },
      ]);
      outlets = await this.OutletModel.aggregate([
        {
          $match: {
            deletedAt: null,
            'town.id': new Types.ObjectId(dto.townId),
            'route.name': dto.route,
            ...outletFilter,
          },
        },
        {
          $addFields: {
            aiResult: [
              {
                name: 'Meril Vitamin C Soap Bar - Tangerine Orange',
                detectedQty: 43,
              },
              {
                name: 'Meril Baby Soap',
                detectedQty: 37,
              },
              {
                name: 'Meril Milk Soap Bar',
                detectedQty: 32,
              },
              {
                name: 'Meril Vitamin C Soap Bar - Lemon & Lime',
                detectedQty: 48,
              },
              {
                name: 'Meril Milk & Rose Soap Bar',
                detectedQty: 23,
              },
              {
                name: 'Meril Milk & Beli Soap Bar',
                detectedQty: 41,
              },
            ],
          },
        },
        {
          $project: {
            name: 1,
            town: 1,
            channel: 1,
            outletcode: 1,
            contact: '$contactNo',
            lat: 1,
            lon: 1,
            lastVisitedAt: { $ifNull: ['$lastVisitedAt', null] },
            lastOrderAmount: { $ifNull: ['$lastOrderAmount', null] },
            lastOrderedDelivered: { $ifNull: ['$lastOrderDelivered', null] },
            lastOrderId: { $ifNull: ['$lastOrderId', null] },
            aiResult: 1,
          },
        },
      ]);
    }

    return {
      data: {
        towns,
        routes,
        outlets,
      },
    };
  }
}
