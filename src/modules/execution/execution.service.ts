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
}
