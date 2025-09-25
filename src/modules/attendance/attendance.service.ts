import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, User } from './schema/attendance.schema';
import { CreateAttendaceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceQueryDto, MSTeamAttendanceQueryDto } from './dto/query.dto';
import { IUser } from '../user/interfaces/user.interface';
import { startAndEndOfDate } from 'src/utils/utils';
import { GetAttendanceTrackerDto } from './dto/attendance-tracker.dto';
import { UserType } from '../user/interfaces/user.type';
import { Town } from '../data-management/town/schema/town.schema';
import { ObjectId } from 'mongodb';
import * as dayjs from 'dayjs';
import * as haversine from 'haversine-distance';
import { LeaveStatusType } from '../leave/interface/leave-status.type';
@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel('Attendance')
    private readonly attendanceModel: Model<Attendance>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @InjectModel(Town.name)
    private readonly townModel: Model<Town>,
  ) {}

  async createAttendance(CreateAttendaceDto: CreateAttendaceDto, user: IUser) {
    const { startOfToday, endOfToday } = startAndEndOfDate(new Date());
    const attendanceExist = await this.attendanceModel.findOne({
      'user.id': user._id,
      punchInAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });
    if (attendanceExist)
      throw new BadRequestException('You already have an Attendance of today');

    const town = await this.townModel.findById(CreateAttendaceDto.townId);

    if (
      town.lat &&
      town.lon &&
      CreateAttendaceDto.lat &&
      CreateAttendaceDto.lon
    ) {
      const a = { lat: town.lat, lon: town.lon };
      const b = { lat: CreateAttendaceDto.lat, lon: CreateAttendaceDto.lon };

      CreateAttendaceDto.distance = +haversine(a, b).toFixed(2);
      CreateAttendaceDto.withinRadius = CreateAttendaceDto.distance <= 50;
    }

    const newData = {
      user: {
        id: user._id,
        name: user.name,
        kind: user.kind,
      },
      ...CreateAttendaceDto,
      punchInAt: new Date(),
    };
    const attendance = await this.attendanceModel.create(newData);
    if (!attendance) {
      throw new BadRequestException(
        'An error occurred while creating the attendance.',
      );
    }
    const bdtTime = dayjs(attendance.punchInAt).tz('Asia/Dhaka');
    if (
      !(bdtTime.hour() < 9 || (bdtTime.hour() === 9 && bdtTime.minute() <= 0))
    ) {
      attendance.late = true;
      await attendance.save();
    }

    return { data: attendance };
  }

  async findOneAttendance(id: string) {
    try {
      const attendance = await this.attendanceModel.findOne({
        _id: id,
        deletedAt: null,
      });
      if (!attendance) {
        throw new NotFoundException(
          `Attendance with ID: ${id} does not exist.`,
        );
      }
      return { data: attendance };
    } catch (error) {
      throw new NotFoundException(`Attendance with ID: ${id} does not exist.`);
    }
  }

  async updateAttendance(id: string, UpdateAttendanceDto: UpdateAttendanceDto) {
    const attendance: any = await this.attendanceModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID: ${id} does not exist.`);
    }
    const data = await this.attendanceModel.findByIdAndUpdate(
      id,
      {
        ...UpdateAttendanceDto,
        punchOutAt: UpdateAttendanceDto.punchOutAt
          ? new Date()
          : attendance.punchOutAt,
      },
      {
        new: true,
      },
    );
    return { data: data };
  }

  async removeAttendance(id: string) {
    const attendance = await this.attendanceModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID: ${id} does not exist.`);
    }
    attendance.deletedAt = new Date();
    await attendance.save();
    return { data: attendance };
  }

  async findAttendancesOfSignedInUser(user: IUser, query: AttendanceQueryDto) {
    const inputDate = new Date(query.date);
    const { startOfMonth, endOfMonth } = startAndEndOfDate(inputDate);
    const attendances = await this.attendanceModel.aggregate([
      {
        $match: {
          townId: { $in: user.town },
          'user.id': new Types.ObjectId(user._id),
          deletedAt: null,
          punchInAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $sort: {
          punchInAt: -1,
        },
      },
      {
        $project: {
          _id: 0,
          name: '$user.name',
          kind: '$user.kind',
          image: 1,
          withinRadius: 1,
          punchInAt: 1,
          punchOutAt: 1,
          isFaceMatched: 1,
          late: 1,
        },
      },
    ]);
    return { data: attendances };
  }

  async findAttendancesAsSupervisor(user: IUser, query: AttendanceQueryDto) {
    const date = new Date(query.date);
    const { startOfToday, endOfToday } = startAndEndOfDate(date);
    const attendancesOfEmployees = await this.userModel.aggregate([
      {
        $match: {
          supervisor: user._id,
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user.id',
          pipeline: [
            {
              $match: {
                punchInAt: {
                  $gte: startOfToday,
                  $lte: endOfToday,
                },
                deletedAt: null,
              },
            },
          ],
          as: 'attendance',
        },
      },
      {
        $unwind: '$attendance',
      },
      {
        $sort: {
          'attendance.punchInAt': -1,
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          username: 1,
          kind: 1,
          image: '$attendance.image',
          withinRadius: '$attendance.withinRadius',
          punchInAt: '$attendance.punchInAt',
          punchOutAt: '$attendance.punchOutAt',
        },
      },
    ]);

    return { data: attendancesOfEmployees };
  }

  async attendanceTracker(
    query: GetAttendanceTrackerDto,
    user: { msId: ObjectId[]; townsId: ObjectId[]; projectAccess: string[] },
  ) {
    //console.log({ user });
    const { startOfToday, endOfToday } = startAndEndOfDate(new Date());
    const {
      regionId,
      areaId,
      territoryId,
      townId,
      date,
      employeeLevel,
      isLocationMatched,
      employeeCode,
      townCode,
      lateAttendance,
      employeeId,
    } = query;
    let filterQuery: any = {};
    let userFilterQuery: any = {};
    let filterAttendanceForMs: any = {};
    let filterUserForMs: any = {};
    let projectAccessQuery: any = {};
    let projectAccessQueryForUser: any = {};
    if (user?.projectAccess?.length > 0) {
      projectAccessQuery['user.kind'] = user?.projectAccess[0];
      projectAccessQueryForUser['kind'] = user?.projectAccess[0];
    }
    let dayQuery: any = {
      punchInAt: { $gte: startOfToday, $lte: endOfToday },
    };
    let leaveDayQuery: any = {
      'leave.startAt': { $lte: startOfToday },
      'leave.endAt': { $gte: startOfToday },
    };
    let townQuery: any = {};

    if (user?.townsId?.length > 0) {
      townQuery = {
        ...townQuery,
        _id: {
          $in: user.townsId.map((v) => new Types.ObjectId(v)),
        },
      };
    }
    if (user?.msId?.length > 0) {
      filterAttendanceForMs['$or'] = [
        { 'user.supervisor': { $in: user.msId } },
        { 'user._id': { $in: user.msId } },
      ];
      filterUserForMs['$or'] = [
        { supervisor: { $in: user.msId } },
        { _id: { $in: user.msId } },
      ];
    }
    if (townId && townId.length) {
      townQuery = {
        ...townQuery,
        _id: {
          $in: townId.map((v) => new Types.ObjectId(v)),
        },
      };
    }
    if (territoryId && territoryId.length) {
      townQuery = {
        ...townQuery,
        territoryId: {
          $in: territoryId.map((v) => new Types.ObjectId(v)),
        },
      };
    }
    if (areaId && areaId.length) {
      townQuery = {
        ...townQuery,
        areaId: {
          $in: areaId.map((v) => new Types.ObjectId(v)),
        },
      };
    }
    if (regionId && regionId.length) {
      townQuery = {
        ...townQuery,
        regionId: {
          $in: regionId.map((v) => new Types.ObjectId(v)),
        },
      };
    }
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
      userFilterQuery['town'] = {
        $in: result[0]?.town,
      };
    }
    if (date) {
      const date = new Date(
        query.date.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3'),
      );

      const { startOfToday: start, endOfToday: end } = startAndEndOfDate(date);
      dayQuery = {
        punchInAt: { $gte: start, $lte: end },
      };
      leaveDayQuery = {
        'leave.startAt': { $lte: start },
        'leave.endAt': { $gte: start },
      };
    }
    if (employeeLevel) {
      filterQuery['user.kind'] = { $in: employeeLevel };
      userFilterQuery['kind'] = { $in: employeeLevel };
      projectAccessQuery['user.kind'] = { $in: employeeLevel };
      projectAccessQueryForUser['kind'] = { $in: employeeLevel };
    }
    if (isLocationMatched) {
      filterQuery['withinRadius'] = isLocationMatched === 'yes' ? true : false;
    }
    if (employeeCode) {
      const user = await this.userModel.findOne({ usercode: employeeCode });
      filterQuery['user.id'] = user ? user._id : null;
    }
    if (townCode) {
      const town = await this.townModel.findOne({ towncode: townCode });
      townQuery = { townId: town ? town._id : null };
      userFilterQuery['town'] = town ? town._id : null;
    }
    if (lateAttendance) {
      filterQuery['late'] = lateAttendance === 'yes' ? true : false;
    }
    if (employeeId) {
      filterQuery['user.id'] = new Types.ObjectId(employeeId);
    }
    const data = await this.attendanceModel.aggregate([
      {
        $match: {
          ...dayQuery,
          ...townQuery,
          ...projectAccessQuery,
          ...filterQuery,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user.id',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                kind: 1,
                name: 1,
                usercode: 1,
                username: 1,
                supervisor: 1,
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
          ...filterAttendanceForMs,
        },
      },
      {
        $project: {
          _id: 0,
          firstExecutionAt: 0,
          lastExecutionAt: 0,
        },
      },
    ]);

    const usersInfo = await this.userModel.aggregate([
      {
        $match: {
          kind: { $ne: UserType.ADMIN },
          ...projectAccessQueryForUser,
          ...userFilterQuery,
          ...filterUserForMs,
        },
      },
      {
        $group: {
          _id: '$kind',
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user.kind',
          pipeline: [
            {
              $match: {
                ...townQuery,
                ...dayQuery,
                deletedAt: null,
              },
            },
            {
              $count: 'present',
            },
          ],
          as: 'attendance',
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user.kind',
          pipeline: [
            {
              $match: {
                ...townQuery,
                ...dayQuery,
                withinRadius: false,
                deletedAt: null,
              },
            },
            {
              $count: 'error',
            },
          ],
          as: 'locationError',
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user.kind',
          pipeline: [
            {
              $match: {
                ...townQuery,
                ...dayQuery,
                late: true,
                deletedAt: null,
              },
            },
            {
              $count: 'error',
            },
          ],
          as: 'lateError',
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user.kind',
          pipeline: [
            {
              $match: {
                ...townQuery,
                ...dayQuery,
                isFaceMatched: false,
                deletedAt: null,
              },
            },
            {
              $count: 'error',
            },
          ],
          as: 'faceError',
        },
      },
      {
        $lookup: {
          from: 'leaves',
          localField: '_id',
          foreignField: 'user.userType',
          pipeline: [
            {
              $match: {
                ...townQuery,
                deletedAt: null,
              },
            },
            {
              $unwind: '$leave',
            },
            {
              $match: {
                'leave.status': LeaveStatusType.APPROVE,
                ...leaveDayQuery,
              },
            },
            {
              $group: {
                _id: '$user.id',
              },
            },
            {
              $count: 'onLeave',
            },
          ],
          as: 'usersOnLeave',
        },
      },
      {
        $match: {
          _id: { $ne: UserType.DFF },
        },
      },
      {
        $project: {
          _id: 0,
          userType: '$_id',
          total: '$total',
          present: {
            $cond: [
              { $eq: [{ $size: '$attendance' }, 0] },
              0,
              { $first: '$attendance.present' },
            ],
          },
          error: {
            $cond: [
              { $eq: [{ $size: '$locationError' }, 0] },
              0,
              { $first: '$locationError.error' },
            ],
          },
          faceError: {
            $cond: [
              { $eq: [{ $size: '$faceError' }, 0] },
              0,
              { $first: '$faceError.error' },
            ],
          },
          lateError: {
            $cond: [
              { $eq: [{ $size: '$lateError' }, 0] },
              0,
              { $first: '$lateError.error' },
            ],
          },
          onLeave: {
            $cond: [
              { $eq: [{ $size: '$usersOnLeave' }, 0] },
              0,
              { $first: '$usersOnLeave.onLeave' },
            ],
          },
        },
      },
    ]);
    return {
      message: 'Data found Successfully',
      data: {
        list: data,
        meta: usersInfo,
      },
    };
  }

  async checkTodayAttendance(user: IUser) {
    const { startOfToday, endOfToday } = startAndEndOfDate();
    if (user.kind !== UserType.AGENCY && user.kind !== UserType.DFF) {
      let attendance = await this.attendanceModel.findOne({
        'user.id': user._id,
        punchInAt: {
          $gte: startOfToday,
          $lte: endOfToday,
        },
      });

      if (!attendance)
        throw new BadRequestException('Please submit your attendance first');
    }
  }
  async findAttendancesAsSupervisorV2(
    user: IUser,
    query: MSTeamAttendanceQueryDto,
  ) {
    const { startOfToday: start } = startAndEndOfDate(query.startAt);
    const { endOfToday: end } = startAndEndOfDate(query.endAt);
    const filterCM = {};
    if (query.cmId) filterCM['_id'] = new Types.ObjectId(query.cmId);
    const attendancesOfEmployees = await this.userModel.aggregate([
      {
        $match: {
          supervisor: user._id,
          ...filterCM,
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: 'town',
          foreignField: 'townId',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user.id', '$$userId'] },
                punchInAt: {
                  $gte: start,
                  $lte: end,
                },
                deletedAt: null,
              },
            },
          ],
          as: 'attendance',
        },
      },
      {
        $unwind: '$attendance',
      },
      {
        $sort: {
          'attendance.punchInAt': -1,
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          username: 1,
          kind: 1,
          image: '$attendance.image',
          withinRadius: '$attendance.withinRadius',
          isFaceMatched: '$attendance.isFaceMatched',
          late: '$attendance.late',
          punchInAt: '$attendance.punchInAt',
          punchOutAt: '$attendance.punchOutAt',
        },
      },
    ]);

    return { data: attendancesOfEmployees };
  }

  async attendanceTrackerV2(
    query: GetAttendanceTrackerDto,
    user: { msId: ObjectId[]; townsId: ObjectId[]; projectAccess: string[] },
  ) {
    //console.log({ user });
    const { startOfToday, endOfToday } = startAndEndOfDate(new Date());
    const {
      regionId,
      areaId,
      territoryId,
      townId,
      date,
      employeeLevel,
      isLocationMatched,
      employeeCode,
      townCode,
      lateAttendance,
      employeeId,
      facialError,
    } = query;
    const filterQuery: any = {};
    const userFilterQuery: any = {};
    const filterAttendanceForMs: any = {};
    const filterUserForMs: any = {};
    const projectAccessQuery: any = {};
    const projectAccessQueryForUser: any = {};

    const absentUserQuery: any = {};

    if (user?.projectAccess?.length > 0) {
      projectAccessQuery['user.kind'] = user?.projectAccess[0];
      projectAccessQueryForUser['kind'] = user?.projectAccess[0];
    }
    let dayQuery: any = {
      punchInAt: { $gte: startOfToday, $lte: endOfToday },
    };
    let leaveDayQuery: any = {
      'leave.startAt': { $lte: startOfToday },
      'leave.endAt': { $gte: startOfToday },
    };
    let townQuery: any = {};

    if (user?.townsId?.length > 0) {
      townQuery = {
        ...townQuery,
        _id: {
          $in: user.townsId.map((v) => new Types.ObjectId(v)),
        },
      };
    }
    if (user?.msId?.length > 0) {
      filterAttendanceForMs['$or'] = [
        { 'user.supervisor': { $in: user.msId } },
        { 'user._id': { $in: user.msId } },
      ];
      filterUserForMs['$or'] = [
        { supervisor: { $in: user.msId } },
        { _id: { $in: user.msId } },
      ];
    }
    if (townId && townId.length) {
      townQuery = {
        ...townQuery,
        _id: {
          $in: townId.map((v) => new Types.ObjectId(v)),
        },
      };
    }
    if (territoryId && territoryId.length) {
      townQuery = {
        ...townQuery,
        territoryId: {
          $in: territoryId.map((v) => new Types.ObjectId(v)),
        },
      };
    }
    if (areaId && areaId.length) {
      townQuery = {
        ...townQuery,
        areaId: {
          $in: areaId.map((v) => new Types.ObjectId(v)),
        },
      };
    }
    if (regionId && regionId.length) {
      townQuery = {
        ...townQuery,
        regionId: {
          $in: regionId.map((v) => new Types.ObjectId(v)),
        },
      };
    }
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
      userFilterQuery['town'] = {
        $in: result[0]?.town,
      };
    }
    if (date) {
      const date = new Date(
        query.date.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3'),
      );

      const { startOfToday: start, endOfToday: end } = startAndEndOfDate(date);
      dayQuery = {
        punchInAt: { $gte: start, $lte: end },
      };
      leaveDayQuery = {
        'leave.startAt': { $lte: start },
        'leave.endAt': { $gte: start },
      };
    }
    if (employeeLevel) {
      filterQuery['user.kind'] = { $in: employeeLevel };
      userFilterQuery['kind'] = { $in: employeeLevel };
      projectAccessQuery['user.kind'] = { $in: employeeLevel };
      projectAccessQueryForUser['kind'] = { $in: employeeLevel };
    }
    if (isLocationMatched) {
      filterQuery['withinRadius'] = isLocationMatched === 'yes' ? true : false;
    }
    if (employeeCode) {
      const user = await this.userModel.findOne({
        usercode: employeeCode,
        deletedAt: null,
      });
      filterQuery['user.id'] = user ? user._id : null;
    }
    if (townCode) {
      const town = await this.townModel.findOne({ towncode: townCode });
      townQuery = { townId: town ? town._id : null };
      userFilterQuery['town'] = town ? town._id : null;
    }
    if (lateAttendance) {
      filterQuery['late'] = lateAttendance === 'yes' ? true : false;
    }
    if (employeeId) {
      filterQuery['user.id'] = new Types.ObjectId(employeeId);
    }
    if (facialError) {
      filterQuery['isFaceMatched'] = facialError === 'yes' ? false : true;
    }
    const presentList = await this.attendanceModel.aggregate([
      {
        $match: {
          ...dayQuery,
          ...townQuery,
          ...projectAccessQuery,
          ...filterQuery,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user.id',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                kind: 1,
                name: 1,
                usercode: 1,
                username: 1,
                supervisor: 1,
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
          ...filterAttendanceForMs,
        },
      },
      {
        $project: {
          _id: 0,
          firstExecutionAt: 0,
          lastExecutionAt: 0,
        },
      },
    ]);

    const usersInfo = await this.userModel.aggregate([
      {
        $match: {
          kind: {
            $in: [
              UserType.CM,
              UserType.MS,
              UserType.WMA,
              UserType.CC,
              UserType.MTCM,
            ],
          },
          ...projectAccessQueryForUser,
          ...userFilterQuery,
          ...filterUserForMs,
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: '$kind',
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user.kind',
          pipeline: [
            {
              $match: {
                ...townQuery,
                ...dayQuery,
                deletedAt: null,
              },
            },
            {
              $count: 'present',
            },
          ],
          as: 'attendance',
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user.kind',
          pipeline: [
            {
              $match: {
                ...townQuery,
                ...dayQuery,
                withinRadius: false,
                deletedAt: null,
              },
            },
            {
              $count: 'error',
            },
          ],
          as: 'locationError',
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user.kind',
          pipeline: [
            {
              $match: {
                ...townQuery,
                ...dayQuery,
                late: true,
                deletedAt: null,
              },
            },
            {
              $count: 'error',
            },
          ],
          as: 'lateError',
        },
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'user.kind',
          pipeline: [
            {
              $match: {
                ...townQuery,
                ...dayQuery,
                isFaceMatched: false,
                deletedAt: null,
              },
            },
            {
              $count: 'error',
            },
          ],
          as: 'faceError',
        },
      },
      {
        $lookup: {
          from: 'leaves',
          localField: '_id',
          foreignField: 'user.userType',
          pipeline: [
            {
              $match: {
                ...townQuery,
                deletedAt: null,
              },
            },
            {
              $unwind: '$leave',
            },
            {
              $match: {
                'leave.status': LeaveStatusType.APPROVE,
                ...leaveDayQuery,
              },
            },
            {
              $group: {
                _id: '$user.id',
              },
            },
            {
              $count: 'onLeave',
            },
          ],
          as: 'usersOnLeave',
        },
      },
      {
        $match: {
          _id: { $ne: UserType.DFF },
        },
      },
      {
        $project: {
          _id: 0,
          userType: '$_id',
          total: '$total',
          present: {
            $cond: [
              { $eq: [{ $size: '$attendance' }, 0] },
              0,
              { $first: '$attendance.present' },
            ],
          },
          error: {
            $cond: [
              { $eq: [{ $size: '$locationError' }, 0] },
              0,
              { $first: '$locationError.error' },
            ],
          },
          faceError: {
            $cond: [
              { $eq: [{ $size: '$faceError' }, 0] },
              0,
              { $first: '$faceError.error' },
            ],
          },
          lateError: {
            $cond: [
              { $eq: [{ $size: '$lateError' }, 0] },
              0,
              { $first: '$lateError.error' },
            ],
          },
          onLeave: {
            $cond: [
              { $eq: [{ $size: '$usersOnLeave' }, 0] },
              0,
              { $first: '$usersOnLeave.onLeave' },
            ],
          },
        },
      },
    ]);

    const absentUsers = await this.userModel.aggregate([
      {
        $match: {
          _id: {
            $nin: presentList.map((user) => user.user._id),
          },
          username: { $exists: true },
          kind: {
            $in: [
              UserType.CM,
              UserType.MS,
              UserType.WMA,
              UserType.CC,
              UserType.MTCM,
            ],
          },
          ...projectAccessQueryForUser,
          ...userFilterQuery,
          ...filterUserForMs,
          deletedAt: null,
        },
      },
      {
        $match: absentUserQuery,
      },
      {
        $lookup: {
          from: 'leaves',
          localField: 'town',
          foreignField: 'townId',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$user.id', '$$userId'] },
                ...townQuery,
                deletedAt: null,
              },
            },
            {
              $unwind: '$leave',
            },
            {
              $match: {
                'leave.status': LeaveStatusType.APPROVE,
                ...leaveDayQuery,
              },
            },
          ],
          as: 'usersOnLeave',
        },
      },
      {
        $match: {
          'usersOnLeave.0': { $exists: false },
        },
      },
      {
        $project: {
          username: 1,
          usercode: 1,
          image: 1,
          kind: 1,
          name: 1,
        },
      },
    ]);

    const meta = usersInfo.map((info) => {
      const present = info.present || 0;
      const total = info.total || 0;
      const leave = info.onLeave || 0;
      return {
        ...info,
        absent: total - present - leave,
      };
    });

    return {
      message: 'Data found Successfully',
      data: {
        presentList: presentList,
        absentList: absentUsers,
        meta: meta,
      },
    };
  }
}
