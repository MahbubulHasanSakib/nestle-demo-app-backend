import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { dataManagementFilter } from 'src/utils/data-management-filter';
import { FilterDto } from 'src/utils/dto/filter.dto';
import { Town } from '../data-management/town/schema/town.schema';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  startAndEndBetweenSixDays,
  startAndEndOfDate,
  tz,
} from 'src/utils/utils';
import { Execution } from '../execution/schema/execution.schema';
import { Attendance } from '../attendance/schema/attendance.schema';
import { Leave } from '../leave/schema/leave.schema';
import { LeaveStatusType } from '../leave/interface/leave-status.type';
import { User } from '../user/schemas/user.schema';
import * as dayjs from 'dayjs';
import { UserType } from '../user/interfaces/user.type';
import { JobType } from '../execution/interface/job.type';
import { DashboardFilter } from './dto/dashboard-filter.dto';
import { Route } from '../route/schema/route.schema';
@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Town.name)
    private readonly townModel: Model<Town>,
    @InjectModel(Execution.name)
    private readonly executionModel: Model<Execution>,
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>,
    @InjectModel(Leave.name)
    private readonly leaveModel: Model<Leave>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Route.name)
    public readonly routeModel: Model<Route>,
  ) {}
  async dashboard(
    query: DashboardFilter,
    user: { msId: ObjectId[]; townsId: ObjectId[]; projectAccess: string[] },
  ) {
    return { data: [] };
  }
}
