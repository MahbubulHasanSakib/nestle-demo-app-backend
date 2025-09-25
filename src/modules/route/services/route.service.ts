import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateRouteDto } from '../dto/create-route.dto';
import { UpdateRouteDto } from '../dto/update-route.dto';
import { Route } from '../schema/route.schema';
import { Outlet } from 'src/modules/outlet/schema/outlet.schema';
import * as dayjs from 'dayjs';
import { startAndEndOfDate, tz } from 'src/utils/utils';
import { GetRouteTrackerDto } from '../dto/get-route-tracker.dto';
import { User } from 'src/modules/user/schemas/user.schema';
import { Execution } from 'src/modules/execution/schema/execution.schema';
import { UserType } from 'src/modules/user/interfaces/user.type';
import { ObjectId } from 'mongodb';
@Injectable()
export class RouteService {
  constructor(
    @InjectModel(Route.name)
    private readonly routeModel: Model<Route>,
    @InjectModel(Outlet.name)
    private readonly outletModel: Model<Outlet>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Execution.name)
    private readonly executionModel: Model<Execution>,
  ) {}

  async createRoute(CreateRouteDto: CreateRouteDto) {
    const isRouteExist = await this.routeModel.findOne({
      routecode: CreateRouteDto.routecode,
    });

    if (isRouteExist) {
      throw new BadRequestException('This route already exists');
    }

    const route = await this.routeModel.create(CreateRouteDto);
    if (!route) {
      throw new BadRequestException('An error occurred while creating route');
    }
    return { data: { message: 'Route created successfully', route } };
  }

  async findAllRoutes() {
    const routes = await this.routeModel.find({
      deletedAt: null,
    });
    return { data: routes };
  }

  async findOneRoute(id: string) {
    const route = await this.routeModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!route) {
      throw new NotFoundException(`Route with ID: ${id} does not exist.`);
    }
    return { data: route };
  }

  async updateRoute(id: string, UpdateRouteDto: UpdateRouteDto) {
    const route = await this.routeModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!route) {
      throw new NotFoundException(`Route with ID: ${id} does not exist.`);
    }
    const data = await this.routeModel.findByIdAndUpdate(id, UpdateRouteDto, {
      new: true,
    });
    return {
      data: { message: 'Route updated successfully', updatedRouteData: data },
    };
  }

  async removeRoute(id: string) {
    const route = await this.routeModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!route) {
      throw new NotFoundException(`Route with ID: ${id} does not exist.`);
    }
    route.deletedAt = new Date();
    await route.save();
    return {
      data: { message: 'Route deleted successfully', deletedRouteData: route },
    };
  }

  async outletsOfRoute(routecode: string) {
    const outlets = await this.outletModel.aggregate([
      {
        $match: {
          'route.routecode': routecode,
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'executions',
          localField: '_id',
          foreignField: 'outlet.id',
          pipeline: [
            {
              $match: {
                executionEndAt: {
                  $gte: dayjs().tz(tz).startOf('month').toDate(),
                  $lte: dayjs().tz(tz).endOf('month').toDate(),
                },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
              },
            },
          ],
          as: 'visit',
        },
      },
      {
        $project: {
          town: 1,
          route: 1,
          name: 1,
          outletcode: 1,
          contactNo: 1,
          channel: 1,
          lat: 1,
          lon: 1,
          job: 1,
          visitNo: {
            $cond: [
              { $gt: [{ $size: '$visit' }, 0] },
              { $first: '$visit.total' },
              0,
            ],
          },
        },
      },
    ]);
    return { data: outlets };
  }
}
