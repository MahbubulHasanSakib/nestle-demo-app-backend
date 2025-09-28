import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TownSummary, UserSummary } from './schema/summary.schema';
import { Model, Types } from 'mongoose';
import { SummaryRepository } from './summary.repository';
import {
  GetTownSummaryQuery,
  GetUserSummaryQuery,
} from './interfaces/queries.type';
import { ResponseUtils } from 'src/utils/response.utils';
import { Constants } from 'src/utils/constants';
import { SummaryKind } from './interfaces/summary-kind.type';
import { startAndEndBetweenSixDays, startAndEndOfDate } from 'src/utils/utils';
import { Town } from '../data-management/town/schema/town.schema';
import { IUser } from '../user/interfaces/user.interface';
import * as dayjs from 'dayjs';
import { UserType } from '../user/interfaces/user.type';
import { Execution } from '../execution/schema/execution.schema';
import { User } from '../user/schemas/user.schema';
import { JobType } from '../execution/interface/job.type';
import { ExecutionCallType } from '../execution/interface/execution-call.type';
import { dataManagementFilter } from 'src/utils/data-management-filter';
import { ObjectId } from 'mongodb';
import { Material } from '../material/schema/material.schema';
import { UserRole } from '../auth/schemas/user-role.schema';
import { RoleHasPermission } from '../auth/schemas/role-has-permission.schema';
import { CmUser } from '../user/schemas/cm-user.schema';
import { Leave } from '../leave/schema/leave.schema';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as localeData from 'dayjs/plugin/localeData';
import * as minMax from 'dayjs/plugin/minMax';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { MsUser } from '../user/schemas/ms-user.schema';
import { Cron } from '@nestjs/schedule';
import { Outlet } from '../outlet/schema/outlet.schema';

dayjs.extend(localeData);

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(minMax);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type Role = 'territoryManager' | 'areaManager' | 'shopperMarketingManager';

type DateRange = { startDay: dayjs.Dayjs; endDay: dayjs.Dayjs };
@Injectable()
export class SummaryService {
  constructor(
    @InjectModel(Town.name) private readonly townModel: Model<Town>,
    @InjectModel(Outlet.name) private readonly outletModel: Model<Outlet>,
    @InjectModel(Execution.name)
    private readonly executionModel: Model<Execution>,
  ) {}

  async cmAppDashboard(user: IUser) {
    const { startOfToday, endOfToday, startOfMonth, endOfMonth } =
      startAndEndOfDate();
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
          _id: '$route.routecode',
        },
      },
    ]);

    let totalSalesToday = await this.executionModel.aggregate([
      {
        $match: {
          'town.id': { $in: user.town },
          executionEndAt: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
          'user.id': new Types.ObjectId(user._id),
        },
      },
      {
        $group: {
          _id: null,
          totalOrderedAmount: { $sum: '$totalOrderedAmount' },
        },
      },
    ]);

    routes = routes.map(({ _id }) => _id);

    let todayOutletTarget = 70;
    let monthlySalesTarget = 300000;

    let todayCoveredOutlet = await this.executionModel.aggregate([
      {
        $match: {
          'town.id': { $in: user.town },
          executionEndAt: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
          'user.id': new Types.ObjectId(user._id),
        },
      },
      {
        $group: {
          _id: '$outlet.id',
        },
      },
    ]);

    let monthlyAchievement = await this.executionModel.aggregate([
      {
        $match: {
          'town.id': { $in: user.town },
          executionEndAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
          'user.id': new Types.ObjectId(user._id),
        },
      },
      {
        $group: {
          _id: null,
          totalOrderedAmount: { $sum: '$totalOrderedAmount' },
        },
      },
    ]);

    return {
      data: {
        routes,
        totalSalesToday: totalSalesToday[0]?.totalOrderedAmount || 0,
        todayOutletTarget,
        todayCoveredOutlet: todayCoveredOutlet?.length || 0,
        monthlySalesTarget,
        monthlyAchievement: monthlyAchievement[0]?.totalOrderedAmount || 0,
        monthlyAchievementPercent: monthlyAchievement[0]
          ? Math.round(
              (monthlyAchievement[0].totalOrderedAmount / monthlySalesTarget) *
                100,
            )
          : 0,
      },
    };
  }
}
