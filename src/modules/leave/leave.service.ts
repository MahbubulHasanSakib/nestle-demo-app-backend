import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Leave, User } from './schema/leave.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { IUser } from '../user/interfaces/user.interface';
import { LeaveKind } from './interface/leave-kind.type';
import { LeaveStatusType } from './interface/leave-status.type';
import * as dayjs from 'dayjs';
import { startAndEndOfDate } from 'src/utils/utils';
import { LeaveApprovalTypeDto } from './dto/approve-reject.dto';
import { UserType } from '../user/interfaces/user.type';
import { LeaveModifiedFrom } from './interface/leave-modified-from.type';
import { SeenNotificationDto } from './dto/seen-notification-dto';
import { GetLeaveRequestsDto } from './dto/get-leave-requests.dto';
import { dataManagementFilter } from 'src/utils/data-management-filter';
import { Town } from '../data-management/town/schema/town.schema';
import { Attendance } from '../attendance/schema/attendance.schema';
import { EntitledCount } from './interface/leave-entilted.type';
import * as mongoose from 'mongoose';

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel('Leave')
    private readonly leaveModel: Model<Leave>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @InjectModel(Town.name)
    private readonly townModel: Model<Town>,
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>,
  ) {}

  async createLeaveRequest(CreateLeaveDto: CreateLeaveDto, user: IUser) {
    const { startOfToday: firstDate } = startAndEndOfDate(
      CreateLeaveDto.startAt,
    );
    const { startOfToday: lastDate, endOfToday: lastDateEnd } =
      startAndEndOfDate(CreateLeaveDto.endAt);
    /* const { startOfMonth: startOfMonthOfFirstDate, endOfMonth } =
      startAndEndOfDate(firstDate);
    const { startOfMonth: startOfMonthOfLastDate, endOfMonth: endOfMonth1 } =
      startAndEndOfDate(lastDate);*/
    const attendanceExist = await this.attendanceModel.findOne({
      'user.id': user._id,
      punchInAt: {
        $gte: firstDate,
        $lte: lastDateEnd,
      },
    });
    if (attendanceExist)
      throw new BadRequestException(
        'You already have attendance between the dates',
      );
    const approvedAnnualLeave = await this.leaveModel.findOne({
      'user.id': user._id,
      year: CreateLeaveDto.year,
      kind: LeaveKind.ANNUAL,
    });

    /*const approvedSickLeave = await this.leaveModel.findOne({
      'user.id': user._id,
      year: CreateLeaveDto.year,
      kind: LeaveKind.SICK,
    });*/

    const approvedAnnualLeaveCount = approvedAnnualLeave
      ? approvedAnnualLeave.consumed
      : 0;

    /*const approvedSickLeaveCount = approvedSickLeave
      ? approvedSickLeave.consumed
      : 0;*/

    const totalApprovedYearlyLeave =
      approvedAnnualLeaveCount; /*+ approvedSickLeaveCount;*/

    const isPendingLeaveExist = await this.leaveModel.find({
      'user.id': user._id,
      'leave.status': LeaveStatusType.UNSETTLE,
    });

    if (isPendingLeaveExist.length) {
      throw new BadRequestException(
        'The leave request you previously submitted is awaiting approval.',
      );
    }

    if (totalApprovedYearlyLeave >= 14)
      throw new BadRequestException(
        'You have already consumed 14 days leaves this year',
      );

    /* if (
      CreateLeaveDto.reason === LeaveKind.ANNUAL &&
      approvedAnnualLeaveCount >= 10
    )
      throw new BadRequestException(
        'You have already consumed 10 days annual leave in this year',
      );

    if (CreateLeaveDto.reason === LeaveKind.SICK && approvedSickLeaveCount >= 4)
      throw new BadRequestException(
        'You have already consumed 4 days sick leave in this year',
      );*/

    //const diff = dayjs(lastDate).diff(firstDate, 'day');
    const result = Array.from({
      length:
        dayjs(lastDate)
          .tz('Asia/Dhaka')
          .diff(dayjs(firstDate).tz('Asia/Dhaka'), 'day') + 1,
    }).filter(
      (_, i) =>
        dayjs(firstDate).tz('Asia/Dhaka').add(i, 'day').format('dddd') !==
        'Friday',
    );
    let totalDays = result?.length;

    if (totalDays < 1)
      throw new BadRequestException('Minimum 1 day leave is required');
    if (totalDays > 14)
      throw new BadRequestException('Cannot get more than 14 leaves at a time');

    const alreadyInLeaveCase1 = await this.leaveModel.aggregate([
      {
        $match: {
          'user.id': user._id,
          year: CreateLeaveDto.year,
        },
      },
      {
        $unwind: '$leave',
      },
      {
        $match: {
          'leave.status': 'Approve',
          $or: [
            {
              'leave.startAt': {
                $lte: firstDate,
              },
              'leave.endAt': {
                $gte: firstDate,
              },
            },
            {
              'leave.startAt': {
                $lte: lastDate,
              },
              'leave.endAt': {
                $gte: lastDate,
              },
            },
          ],
        },
      },
    ]);

    const alreadyInLeaveCase2 = await this.leaveModel.aggregate([
      {
        $match: {
          'user.id': user._id,
          year: CreateLeaveDto.year,
        },
      },
      {
        $unwind: '$leave',
      },
      {
        $match: {
          'leave.status': 'Approve',
          $or: [
            {
              'leave.startAt': {
                $gte: firstDate,
                $lte: lastDate,
              },
            },
            {
              'leave.endAt': {
                $gte: firstDate,
                $lte: lastDate,
              },
            },
          ],
        },
      },
    ]);

    if (alreadyInLeaveCase1.length > 0 || alreadyInLeaveCase2.length > 0)
      throw new BadRequestException(
        'Already approved leave exist in your selected date range',
      );

    const totalRemaining = 14 - totalApprovedYearlyLeave;
    if (totalDays > totalRemaining)
      throw new BadRequestException(
        `You have ${totalRemaining} leaves remaining in the year`,
      );

    const townIds = user.town;
    const findLeave = await this.leaveModel.findOne({
      'user.id': user._id,
      year: CreateLeaveDto.year,
      kind: CreateLeaveDto.reason,
    });

    let leaves = [];
    if (!findLeave) {
      leaves.push({
        startAt: firstDate,
        endAt: lastDate,
        day: totalDays,
        comment: CreateLeaveDto.comment,
      });
      const leave = await this.leaveModel.create({
        user: {
          id: user._id,
          name: user.name,
          userType: user.kind,
        },
        townId: townIds,
        year: CreateLeaveDto.year,
        kind: CreateLeaveDto.reason,
        /*remaining: CreateLeaveDto.reason === LeaveKind.ANNUAL ? 10 : 4,
        entitled: CreateLeaveDto.reason === LeaveKind.ANNUAL ? 10 : 4,*/
        remaining: 14,
        entitled: 14,
        leave: leaves,
      });
      if (!leave)
        throw new BadRequestException(
          'Error occurred in creating leave request',
        );
      return { data: leave };
    } else {
      /*if (totalDays === 2) {
        if (
          startOfMonthOfFirstDate.toString() ===
          startOfMonthOfLastDate.toString()
        ) {
          const approvedLeaves = await this.leaveModel.aggregate([
            {
              $match: {
                'user.id': user._id,
                year: CreateLeaveDto.year,
                'leave.status': LeaveStatusType.APPROVE,
                $or: [
                  {
                    'leave.startAt': {
                      $gte: new Date(startOfMonthOfFirstDate),
                      $lte: new Date(endOfMonth),
                    },
                  },
                  {
                    'leave.endAt': {
                      $gte: new Date(startOfMonthOfFirstDate),
                      $lte: new Date(endOfMonth),
                    },
                  },
                ],
              },
            },
          ]);

          if (approvedLeaves.length)
            throw new BadRequestException(
              'Already approved leave exist in this month',
            );
        } else if (
          startOfMonthOfFirstDate.toString() !==
          startOfMonthOfLastDate.toString()
        ) {
          const approvedLeaves1 = await this.leaveModel.aggregate([
            {
              $match: {
                'user.id': user._id,
                year: CreateLeaveDto.year,
                'leave.status': LeaveStatusType.APPROVE,
                $or: [
                  {
                    'leave.startAt': {
                      $gte: new Date(startOfMonthOfFirstDate),
                      $lte: new Date(endOfMonth),
                    },
                  },
                  {
                    'leave.endAt': {
                      $gte: new Date(startOfMonthOfFirstDate),
                      $lte: new Date(endOfMonth),
                    },
                  },
                ],
              },
            },
          ]);
          let consumedDaysInPreviousMonth = 0;
          let matchedLeaves = [];

          approvedLeaves1?.forEach((leave) => {
            const findLeaves = leave?.leave?.filter((l: any) => {
              return (
                ((new Date(l.startAt) >= new Date(startOfMonthOfFirstDate) &&
                  new Date(l.startAt) <= new Date(endOfMonth)) ||
                  (new Date(l.endAt) >= new Date(startOfMonthOfFirstDate) &&
                    new Date(l.endAt) <= new Date(endOfMonth))) &&
                l.status === LeaveStatusType.APPROVE
              );
            });
            matchedLeaves.push(...findLeaves);
          });

          matchedLeaves.forEach((m) => {
            const { startOfMonth: st1 } = startAndEndOfDate(
              new Date(m.startAt),
            );
            const { startOfMonth: st2 } = startAndEndOfDate(new Date(m.endAt));
            if (st1.toString() === st2.toString())
              consumedDaysInPreviousMonth += m.day;
            else consumedDaysInPreviousMonth += 1;
          });

          const approvedLeaves2 = await this.leaveModel.aggregate([
            {
              $match: {
                'user.id': user._id,
                year: CreateLeaveDto.year,
                'leave.status': LeaveStatusType.APPROVE,
                $or: [
                  {
                    'leave.startAt': {
                      $gte: new Date(startOfMonthOfLastDate),
                      $lte: new Date(endOfMonth1),
                    },
                  },
                  {
                    'leave.endAt': {
                      $gte: new Date(startOfMonthOfLastDate),
                      $lte: new Date(endOfMonth1),
                    },
                  },
                ],
              },
            },
          ]);
          let consumedDaysInNextMonth = 0;
          let matchedLeaves1 = [];
          approvedLeaves2?.forEach((leave) => {
            const findLeaves = leave?.leave?.filter((l: any) => {
              return (
                ((new Date(l.startAt) >= new Date(startOfMonthOfLastDate) &&
                  new Date(l.startAt) <= new Date(endOfMonth1)) ||
                  (new Date(l.endAt) >= new Date(startOfMonthOfLastDate) &&
                    new Date(l.endAt) <= new Date(endOfMonth1))) &&
                l.status === LeaveStatusType.APPROVE
              );
            });
            matchedLeaves1.push(...findLeaves);
          });

          matchedLeaves1.forEach((m) => {
            const { startOfMonth: st1 } = startAndEndOfDate(
              new Date(m.startAt),
            );
            const { startOfMonth: st2 } = startAndEndOfDate(new Date(m.endAt));

            if (st1.toString() === st2.toString())
              consumedDaysInNextMonth += m.day;
            else consumedDaysInNextMonth += 1;
          });

          if (consumedDaysInPreviousMonth > 1)
            throw new BadRequestException(
              `Already ${consumedDaysInPreviousMonth}  approved leaves exist in previous month`,
            );
          if (consumedDaysInNextMonth > 1)
            throw new BadRequestException(
              `Already ${consumedDaysInNextMonth}  approved leaves exist next  month`,
            );
        }
      } else if (totalDays === 1) {
        const approvedLeaves = await this.leaveModel.aggregate([
          {
            $match: {
              'user.id': user._id,
              year: CreateLeaveDto.year,
              'leave.status': LeaveStatusType.APPROVE,
              $or: [
                {
                  'leave.startAt': {
                    $gte: new Date(startOfMonthOfFirstDate),
                    $lte: new Date(endOfMonth),
                  },
                },
                {
                  'leave.endAt': {
                    $gte: new Date(startOfMonthOfFirstDate),
                    $lte: new Date(endOfMonth),
                  },
                },
              ],
            },
          },
        ]);
        let consumedDaysInThisMonth = 0;
        let matchedLeaves = [];

        approvedLeaves?.forEach((leave) => {
          const findLeaves = leave?.leave?.filter((l: any) => {
            return (
              ((new Date(l.startAt) >= new Date(startOfMonthOfFirstDate) &&
                new Date(l.startAt) <= new Date(endOfMonth)) ||
                (new Date(l.endAt) >= new Date(startOfMonthOfFirstDate) &&
                  new Date(l.endAt) <= new Date(endOfMonth))) &&
              l.status === LeaveStatusType.APPROVE
            );
          });
          matchedLeaves.push(...findLeaves);
        });

        matchedLeaves.forEach((m) => {
          const { startOfMonth: st1 } = startAndEndOfDate(new Date(m.startAt));
          const { startOfMonth: st2 } = startAndEndOfDate(new Date(m.endAt));
          if (st1.toString() === st2.toString())
            consumedDaysInThisMonth += m.day;
          else consumedDaysInThisMonth += 1;
        });

        if (consumedDaysInThisMonth > 1)
          throw new BadRequestException(
            `Already ${consumedDaysInThisMonth} approved leaves exist this  month`,
          );
      } */
      leaves = [
        ...findLeave.leave,
        {
          startAt: firstDate,
          endAt: lastDate,
          day: totalDays,
          comment: CreateLeaveDto.comment,
          notifiedAt: null,
          seenAt: null,
          modifier: null,
          modified: null,
        },
      ];
      const updatedLeave = await this.leaveModel.updateOne(
        {
          'user.id': user._id,
          year: CreateLeaveDto.year,
          kind: CreateLeaveDto.reason,
        },
        {
          $set: {
            leave: leaves,
          },
        },
        { new: true },
      );
      return { data: updatedLeave };
    }
  }

  async getAllLeaveRequestAsMs(user: IUser) {
    const getAllLeaveRequestsofEmployees = await this.userModel.aggregate([
      {
        $match: {
          supervisor: user._id,
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'leaves',
          localField: '_id',
          foreignField: 'user.id',
          as: 'leaves',
        },
      },
      {
        $unwind: '$leaves',
      },
      {
        $match: {
          'leaves.leave.status': LeaveStatusType.UNSETTLE,
          'leaves.deletedAt': null,
        },
      },
    ]);

    let pendingRequest = getAllLeaveRequestsofEmployees.map((l) => {
      let data = l?.leaves?.leave?.filter(
        (d) => d.status == LeaveStatusType.UNSETTLE,
      );
      data = data.map((d) => {
        const temp = { ...d };
        temp.userName = l?.name;
        temp.userId = l?._id;
        temp.reason = l?.leaves?.kind;
        temp.year = l?.leaves?.year;
        return temp;
      });
      return data;
    });
    pendingRequest = pendingRequest?.flat();
    return { data: pendingRequest };
  }

  async approveOrRejectLeaveRequest(
    user: IUser,
    LeaveApprovalTypeDto: LeaveApprovalTypeDto,
  ) {
    const isSupervisor = await this.userModel.findOne({
      _id: new Types.ObjectId(LeaveApprovalTypeDto.userId),
      supervisor: user._id,
      deletedAt: null,
    });
    const findUser: IUser = await this.userModel.findOne({
      _id: user._id,
      deletedAt: null,
    });

    if (isSupervisor || (findUser && findUser.kind === UserType.ADMIN)) {
      const modifiedFrom =
        LeaveApprovalTypeDto.modifiedOn === LeaveModifiedFrom.APP
          ? LeaveModifiedFrom.APP
          : LeaveModifiedFrom.PORTAL;

      const updatedResult = await this.leaveModel.updateOne(
        {
          'user.id': new Types.ObjectId(LeaveApprovalTypeDto.userId),
          /*year: LeaveApprovalTypeDto.year,
          kind: LeaveApprovalTypeDto.reason,*/
          'leave._id': new Types.ObjectId(LeaveApprovalTypeDto.leaveId),
          deletedAt: null,
        },
        {
          $set: {
            'leave.$[el].status': LeaveApprovalTypeDto.status,
            'leave.$[el].notifiedAt': new Date(),
            'leave.$[el].modified': new Date(),
            'leave.$[el].modifiedOn': modifiedFrom,
            'leave.$[el].modifier': user._id,
          },
        },
        {
          arrayFilters: [
            {
              /*'el.startAt': LeaveApprovalTypeDto.startAt,
              'el.endAt': LeaveApprovalTypeDto.endAt,*/
              'el._id': LeaveApprovalTypeDto.leaveId,
            },
          ],
          new: true,
        },
      );

      if (updatedResult) {
        await this.leaveModel.updateOne(
          {
            'user.id': new Types.ObjectId(LeaveApprovalTypeDto.userId),
            /*year: LeaveApprovalTypeDto.year,
            kind: LeaveApprovalTypeDto.reason,*/
            'leave._id': new Types.ObjectId(LeaveApprovalTypeDto.leaveId),
            deletedAt: null,
          },
          {
            $inc: {
              ...(LeaveApprovalTypeDto.status === LeaveStatusType.APPROVE && {
                consumed: LeaveApprovalTypeDto.day,
                remaining: LeaveApprovalTypeDto.day * -1,
              }),
            },
          },
        );
        return {
          data: {
            message: `Leave Request of user with id-${LeaveApprovalTypeDto.userId} is ${LeaveApprovalTypeDto.status}d`,
          },
        };
      }
    } else
      throw new BadRequestException(
        'You are not supervisor or admin of this user',
      );
  }

  async leaveSummary(user: IUser) {
    const leave = await this.leaveModel.aggregate([
      {
        $match: {
          'user.id': user._id,
          year: new Date().getFullYear(),
          deletedAt: null,
        },
      },
      {
        $project: {
          _id: 0,
          user: 1,
          year: 1,
          entitled: 1,
          remaining: 1,
          consumed: 1,
          kind: 1,
        },
      },
    ]);
    if (leave?.length === 0) {
      return {
        data: [
          {
            user: {
              id: user?._id,
              name: user?.name,
              userType: user?.kind,
            },
            year: new Date().getFullYear(),
            remaining: EntitledCount.SICK,
            consumed: 0,
            entitled: EntitledCount.SICK,
            kind: LeaveKind.SICK,
          },
          {
            user: {
              id: user?._id,
              name: user?.name,
              userType: user?.kind,
              usercode: user?.usercode,
            },
            year: new Date().getFullYear(),
            remaining: EntitledCount.ANNUAL,
            consumed: 0,
            entitled: EntitledCount.ANNUAL,
            kind: LeaveKind.ANNUAL,
          },
        ],
      };
    }
    if (leave?.length === 1) {
      return {
        data: [
          {
            user: {
              id: user?._id,
              name: user?.name,
              userType: user?.kind,
            },
            year: leave?.[0]?.year,
            remaining: leave?.[0]?.remaining,
            consumed: leave?.[0]?.consumed,
            entitled: leave?.[0]?.entitled,
            kind: leave?.[0]?.kind,
          },
          {
            user: {
              id: user?._id,
              name: user?.name,
              userType: user?.kind,
            },
            year: new Date().getFullYear(),
            remaining:
              leave?.[0]?.kind === LeaveKind.ANNUAL
                ? EntitledCount.SICK
                : EntitledCount.ANNUAL,
            consumed: 0,
            entitled:
              leave?.[0]?.kind === LeaveKind.ANNUAL
                ? EntitledCount.SICK
                : EntitledCount.ANNUAL,
            kind:
              leave?.[0]?.kind === LeaveKind.ANNUAL
                ? LeaveKind.SICK
                : LeaveKind.ANNUAL,
          },
        ],
      };
    }
    return { data: leave };
  }

  async teamLeaveSummary(user: IUser) {
    const result = await this.userModel.aggregate([
      {
        $match: {
          supervisor: user._id,
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'leaves',
          localField: '_id',
          foreignField: 'user.id',
          pipeline: [
            {
              $match: {
                year: new Date().getFullYear(),
              },
            },
            {
              $group: {
                _id: null,
                consumed: { $sum: '$consumed' },
              },
            },
            {
              $project: {
                _id: false,
              },
            },
          ],
          as: 'leaveSummary',
        },
      },
      {
        $unwind: {
          path: '$leaveSummary',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          entitled: EntitledCount.TOTAL_LEAVES,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          usercode: 1,
          supervisor: 1,
          totalEntitled: '$entitled',
          totalConsumed: '$leaveSummary.consumed',
        },
      },
    ]);
    return { data: result };
  }
  async findAllLeaveNotificationsByUser(user: IUser) {
    const leaves = await this.leaveModel.find({
      'user.id': user._id,
      deletedAt: null,
    });

    let result = {};

    for (const item of leaves) {
      const dt = item.leave.filter(
        (it) => it.status !== LeaveStatusType.UNSETTLE,
      );
      result[`${item.kind}`] = dt;
    }
    const notifications = [];
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        for (const item of result[key]) {
          notifications.push({
            ...item.toJSON(),
            leaveType: key,
            description: `Your ${key} leave request from ${dayjs(item.startAt)
              .tz('Asia/Dhaka')
              .format('DD-MM-YYYY')} to ${dayjs(item.endAt)
              .tz('Asia/Dhaka')
              .format('DD-MM-YYYY')} is ${item.status}d`,
          });
        }
      }
    }

    return { data: notifications };
  }

  async updateLeaveNotificationSeen(
    user: IUser,
    SeenNotificationDto: SeenNotificationDto,
  ) {
    await this.leaveModel.updateOne(
      {
        'user.id': user._id,
        year: SeenNotificationDto.year,
        kind: SeenNotificationDto.kind,
        deletedAt: null,
      },
      {
        $set: {
          'leave.$[el].seenAt': new Date(),
        },
      },
      {
        arrayFilters: [
          {
            'el._id': SeenNotificationDto.leaveId,
          },
        ],
        new: true,
      },
    );
  }

  async getAllLeaveRequestAsAdmin(query: GetLeaveRequestsDto) {
    const { regionId, areaId, territoryId, townId, userId, userLevel } = query;
    let townQuery: any = {};
    let filterUser: any = {};
    let filterUserlevel: any = {};
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
    if (userId) filterUser['user.id'] = new Types.ObjectId(userId);
    if (userLevel) filterUserlevel['user.userLevel'] = userLevel;
    let leaveRequests = await this.leaveModel.aggregate([
      {
        $match: {
          ...townQuery,
          ...filterUser,
          'leave.status': LeaveStatusType.UNSETTLE,
          deletedAt: null,
        },
      },
      {
        $unwind: '$leave',
      },
      {
        $match: {
          'leave.status': LeaveStatusType.UNSETTLE,
        },
      },
      {
        $addFields: {
          'leave.createdAt': {
            $toDate: '$leave._id',
          },
        },
      },
      {
        $project: { _id: 0 },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user.id',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                name: '$name',
                userLevel: '$kind',
                userCode: '$usercode',
              },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $match: {
          ...filterUserlevel,
        },
      },
    ]);
    return { data: leaveRequests };
  }

  async createLeaveRequestV2(createLeaveDto: CreateLeaveDto, user: IUser) {
    /*const user = {
      _id: new Types.ObjectId('65baa57c45e890cf739fa9ec'),
      kind: 'CM',
      name: 'MD.NAZMUL HOSSEN',
      town: new Types.ObjectId('65ba8bc245e890cf739668e8'),
    };*/

    const { startOfToday: firstDate } = startAndEndOfDate(
      createLeaveDto.startAt,
    );
    const { startOfToday: lastDate, endOfToday: lastDateEnd } =
      startAndEndOfDate(createLeaveDto.endAt);
    const attendanceExist = await this.attendanceModel.findOne({
      'user.id': user._id,
      punchInAt: {
        $gte: firstDate,
        $lte: lastDateEnd,
      },
    });
    if (attendanceExist)
      throw new BadRequestException(
        'You already have attendance between the dates',
      );
    const approvedAnnualLeave = await this.leaveModel.findOne({
      'user.id': user._id,
      year: createLeaveDto.year,
      kind: LeaveKind.ANNUAL,
    });

    const approvedSickLeave = await this.leaveModel.findOne({
      'user.id': user._id,
      year: createLeaveDto.year,
      kind: LeaveKind.SICK,
    });

    const approvedAnnualLeaveCount = approvedAnnualLeave
      ? approvedAnnualLeave.consumed
      : 0;

    const approvedSickLeaveCount = approvedSickLeave
      ? approvedSickLeave.consumed
      : 0;

    const totalApprovedYearlyLeave =
      approvedAnnualLeaveCount + approvedSickLeaveCount;

    const isPendingLeaveExist = await this.leaveModel.find({
      'user.id': user._id,
      'leave.status': LeaveStatusType.UNSETTLE,
    });

    if (isPendingLeaveExist.length) {
      throw new BadRequestException(
        'The leave request you previously submitted is awaiting approval',
      );
    }

    if (totalApprovedYearlyLeave >= EntitledCount.TOTAL_LEAVES)
      throw new BadRequestException(
        `You have already consumed ${EntitledCount.TOTAL_LEAVES} days of leave this year`,
      );

    if (
      createLeaveDto.reason === LeaveKind.ANNUAL &&
      approvedAnnualLeaveCount >= EntitledCount.ANNUAL
    )
      throw new BadRequestException(
        `You have already consumed ${EntitledCount.ANNUAL} days of casual leave in this year`,
      );

    if (
      createLeaveDto.reason === LeaveKind.SICK &&
      approvedSickLeaveCount >= EntitledCount.SICK
    )
      throw new BadRequestException(
        `You have already consumed ${EntitledCount.SICK} days of sick leave in this year`,
      );

    const result = Array.from({
      length:
        dayjs(lastDate)
          .tz('Asia/Dhaka')
          .diff(dayjs(firstDate).tz('Asia/Dhaka'), 'day') + 1,
    }).filter(
      (_, i) =>
        dayjs(firstDate).tz('Asia/Dhaka').add(i, 'day').format('dddd') !==
        'Friday',
    );
    const totalDays = result?.length;

    if (totalDays < 1)
      throw new BadRequestException('Minimum 1 day leave is required');
    if (totalDays > EntitledCount.TOTAL_LEAVES)
      throw new BadRequestException(
        `Cannot get more than ${EntitledCount.TOTAL_LEAVES} leaves at a time`,
      );

    if (
      createLeaveDto.reason === LeaveKind.SICK &&
      totalDays > EntitledCount.SICK
    )
      throw new BadRequestException(
        `Cannot get more than ${EntitledCount.SICK} sick leaves at a time`,
      );

    if (
      createLeaveDto.reason === LeaveKind.ANNUAL &&
      totalDays > EntitledCount.ANNUAL
    )
      throw new BadRequestException(
        `Cannot get more than ${EntitledCount.ANNUAL} annual leaves at a time`,
      );

    const alreadyInLeaveCase1 = await this.leaveModel.aggregate([
      {
        $match: {
          'user.id': user._id,
          year: createLeaveDto.year,
        },
      },
      {
        $unwind: '$leave',
      },
      {
        $match: {
          'leave.status': 'Approve',
          $or: [
            {
              'leave.startAt': {
                $lte: firstDate,
              },
              'leave.endAt': {
                $gte: firstDate,
              },
            },
            {
              'leave.startAt': {
                $lte: lastDate,
              },
              'leave.endAt': {
                $gte: lastDate,
              },
            },
          ],
        },
      },
    ]);

    const alreadyInLeaveCase2 = await this.leaveModel.aggregate([
      {
        $match: {
          'user.id': user._id,
          year: createLeaveDto.year,
        },
      },
      {
        $unwind: '$leave',
      },
      {
        $match: {
          'leave.status': 'Approve',
          $or: [
            {
              'leave.startAt': {
                $gte: firstDate,
                $lte: lastDate,
              },
            },
            {
              'leave.endAt': {
                $gte: firstDate,
                $lte: lastDate,
              },
            },
          ],
        },
      },
    ]);

    if (alreadyInLeaveCase1.length > 0 || alreadyInLeaveCase2.length > 0)
      throw new BadRequestException(
        `Already approved leave exists in your selected date range`,
      );

    const totalAnnualLeaveRemaining =
      approvedAnnualLeave?.remaining >= 0
        ? approvedAnnualLeave?.remaining
        : EntitledCount.ANNUAL;

    const totalSickLeaveRemaining =
      approvedSickLeave?.remaining >= 0
        ? approvedSickLeave?.remaining
        : EntitledCount.SICK;

    if (
      createLeaveDto.reason === LeaveKind.ANNUAL &&
      totalDays > totalAnnualLeaveRemaining
    )
      throw new BadRequestException(
        `You have ${totalAnnualLeaveRemaining} days of sick leave remaining in this year`,
      );

    if (
      createLeaveDto.reason === LeaveKind.SICK &&
      totalDays > totalSickLeaveRemaining
    )
      throw new BadRequestException(
        `You have ${totalSickLeaveRemaining} days of sick leave remaining in this year`,
      );

    const townIds = user.town;
    const findLeave = await this.leaveModel.findOne({
      'user.id': user._id,
      year: createLeaveDto.year,
      kind: createLeaveDto.reason,
    });

    let leaves = [];
    if (!findLeave) {
      leaves.push({
        startAt: firstDate,
        endAt: lastDate,
        day: totalDays,
        comment: createLeaveDto.comment,
      });
      const firstLeave = {
        user: {
          id: user._id,
          name: user.name,
          userType: user.kind,
        },
        townId: townIds,
        year: createLeaveDto.year,
        kind: createLeaveDto.reason,
        remaining:
          createLeaveDto.reason === LeaveKind.ANNUAL
            ? EntitledCount.ANNUAL
            : EntitledCount.SICK,
        entitled:
          createLeaveDto.reason === LeaveKind.ANNUAL
            ? EntitledCount.ANNUAL
            : EntitledCount.SICK,
        leave: leaves,
      };
      const leave = await this.leaveModel.create(firstLeave);
      if (!leave)
        throw new BadRequestException(
          'Error occurred in creating leave request',
        );
      return { data: leave };
    } else {
      leaves = [
        ...findLeave.leave,
        {
          startAt: firstDate,
          endAt: lastDate,
          day: totalDays,
          comment: createLeaveDto.comment,
          notifiedAt: null,
          seenAt: null,
          modifier: null,
          modified: null,
        },
      ];
      const updatedLeave = await this.leaveModel.updateOne(
        {
          'user.id': user._id,
          year: createLeaveDto.year,
          kind: createLeaveDto.reason,
        },
        {
          $set: {
            leave: leaves,
          },
        },
        { new: true },
      );
      return { data: updatedLeave, message: 'Request Success' };
    }
  }

  async findAllSubordinatesLeaveOfMS(user: IUser) {
    // const user = {
    //   _id: new Types.ObjectId('679bcf8b9ec6e013bee27acc'),
    //   kind: 'MS',
    // };

    if (user.kind !== UserType.MS) {
      throw new BadRequestException('Permission Denied!');
    }

    const subordinatesCMs = await this.userModel
      .find({
        deletedAt: null,
        supervisor: user._id,
      })
      .select({ _id: 1 });

    const data = await this.leaveModel.aggregate([
      {
        $match: {
          'user.id': { $in: subordinatesCMs?.map((usr) => usr._id) },
          deletedAt: null,
          year: new Date().getFullYear(),
        },
      },
      {
        $project: {
          kind: 1,
          year: 1,
          leave: 1,
          user: 1,
        },
      },
      { $unwind: '$leave' },
      {
        $addFields: {
          'leave.kind': '$kind',
          'leave.year': '$year',
          'leave.requestDate': { $toDate: '$leave._id' },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ['$leave', { user: '$user' }] },
        },
      },
      {
        $sort: {
          'leave.requestDate': -1,
        },
      },
    ]);

    return { data, message: 'Request Success' };
  }

  async getAllLeaveRequestAsAdminV2(query: GetLeaveRequestsDto, user: IUser) {
    const {
      regionId,
      areaId,
      territoryId,
      townId,
      userId,
      userLevel,
      page: pageNo,
      limit: pageLimit,
    } = query;

    const page = Number(pageNo) > 0 ? Number(pageNo) : 1;
    const limit = Number(pageLimit) > 0 ? Number(pageLimit) : 20;
    const skip = (page - 1) * pageLimit;

    let townQuery: any = {};
    const filterUser: any = {};
    const filterUserlevel: any = {};
    if (
      regionId?.length > 0 ||
      areaId?.length > 0 ||
      territoryId?.length > 0 ||
      townId?.length > 0 ||
      user?.townsId?.length > 0
    ) {
      townQuery = dataManagementFilter(
        regionId,
        areaId,
        territoryId,
        townId,
        user.townsId,
      );
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
    if (userId) filterUser['user.id'] = new Types.ObjectId(userId);
    if (userLevel) filterUserlevel['user.userLevel'] = userLevel;

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          ...townQuery,
          ...filterUser,
          year: new Date().getFullYear(),
          // 'leave.status': LeaveStatusType.UNSETTLE,
          deletedAt: null,
        },
      },
      {
        $unwind: '$leave',
      },
      {
        $group: {
          _id: {
            year: '$year',
            kind: '$kind',
            user: '$user.id',
          },
          user: {
            $first: '$user',
          },
          consumed: {
            $first: '$consumed',
          },
          entitled: {
            $first: '$entitled',
          },
          remaining: {
            $first: '$remaining',
          },
          leaves: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $group: {
          _id: '$_id.user',
          totalConsumed: {
            $sum: '$consumed',
          },
          remaining: {
            $push: {
              kind: '$_id.kind',
              consumed: '$consumed',
              entitled: '$entitled',
              remaining: '$remaining',
            },
          },
          leaves: {
            $push: '$leaves',
          },
        },
      },
      {
        $unwind: '$leaves',
      },
      {
        $project: {
          _id: 1,
          totalEntitled: 1,
          totalConsumed: 1,
          remaining: 1,
          leaves: 1,
        },
      },
      {
        $unwind: '$leaves',
      },
      {
        $match: {
          'leaves.leave.status': 'Unsettle',
        },
      },
      {
        $addFields: {
          totalEntitled: EntitledCount.TOTAL_LEAVES,
          'leaves.leave.requestDate': {
            $toDate: '$leaves.leave._id',
          },
          remaining: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $eq: [{ $size: '$remaining' }, 1] },
                      {
                        $eq: [{ $arrayElemAt: ['$remaining.kind', 0] }, 'Sick'],
                      },
                    ],
                  },
                  then: {
                    $concatArrays: [
                      '$remaining',
                      [
                        {
                          kind: 'Annual',
                          consumed: 0,
                          entitled: EntitledCount.ANNUAL,
                          remaining: EntitledCount.ANNUAL,
                        },
                      ],
                    ],
                  },
                },
                {
                  case: {
                    $and: [
                      { $eq: [{ $size: '$remaining' }, 1] },
                      {
                        $eq: [
                          { $arrayElemAt: ['$remaining.kind', 0] },
                          'Annual',
                        ],
                      },
                    ],
                  },
                  then: {
                    $concatArrays: [
                      '$remaining',
                      [
                        {
                          kind: 'Sick',
                          consumed: 0,
                          entitled: EntitledCount.SICK,
                          remaining: EntitledCount.SICK,
                        },
                      ],
                    ],
                  },
                },
              ],
              default: '$remaining',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          'leaves._id': 0,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'leaves.user.id',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                userType: '$kind',
                usercode: 1,
              },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $match: {
          ...filterUserlevel,
        },
      },
      {
        $sort: {
          'leaves.leave.requestDate': -1,
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
      await this.leaveModel.aggregate(pipeline);

    return {
      statusCode: 201,
      message: 'Request processed successfully.',
      data,
      meta: { ...meta, limit, page },
    };
  }
}
