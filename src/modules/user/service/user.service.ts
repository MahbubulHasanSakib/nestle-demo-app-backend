import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PipelineStage, Types } from 'mongoose';
import { CmUser } from '../schemas/cm-user.schema';
import { AdminUser } from '../schemas/admin-user.schema';
import { MsUser } from '../schemas/ms-user.schema';
import { UserType } from '../interfaces/user.type';
import * as bcrypt from 'bcrypt';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';
import { startAndEndOfDate, tz } from 'src/utils/utils';
import { IUser } from '../interfaces/user.interface';
import { WmaUser } from '../schemas/wma-user.schema';
import { DffUser } from '../schemas/dff-user.schema';
import { CcUser } from '../schemas/cc-user.schema';
import { MtcmUser } from '../schemas/mtcm-user.schema';
import { AgencyUser } from '../schemas/agency-user.schema';
import { RcUser } from '../schemas/rc-user.schema';
import { SearchEmployee } from '../dto/search-employee.dto';
import { dataManagementFilter } from 'src/utils/data-management-filter';
import { Town } from 'src/modules/data-management/town/schema/town.schema';
import { DailyActivityReportDto } from '../dto/daily-activity-report.dto';
import { Attendance } from 'src/modules/attendance/schema/attendance.schema';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { UserRole } from 'src/modules/auth/schemas/user-role.schema';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { Draft } from '../schemas/draft.schema';
import { Outlet } from 'src/modules/outlet/schema/outlet.schema';
import { ForgetPasswordDto } from '../dto/forget-password.dto';
import axios from 'axios';
import { SMSSendDto } from '../dto/sms-send.dto';
import { AccountOpenRequest } from '../dto/account-open-request.dto';
import { ActiveStatus } from '../interfaces/activity.type';
import { ViewUserDto } from '../dto/view-user.dto';
import { Region } from 'src/modules/data-management/region/schema/region.schema';
import { SuspendUserDto } from '../dto/suspend-user.dto';
import { FilterUserByKindDto } from '../dto/Filter-by-kind.dto';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(CmUser.name) private cmUserModel: Model<CmUser>,
    @InjectModel(MsUser.name) private msUserModel: Model<MsUser>,
    @InjectModel(WmaUser.name) private wmaUserModel: Model<WmaUser>,
    @InjectModel(DffUser.name) private dffUserModel: Model<DffUser>,
    @InjectModel(CcUser.name) private ccUserModel: Model<CcUser>,
    @InjectModel(MtcmUser.name) private mtcmUserModel: Model<MtcmUser>,
    @InjectModel(AgencyUser.name) private agencyUserModel: Model<AgencyUser>,
    @InjectModel(RcUser.name) private rcUserModel: Model<RcUser>,
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUser>,
    @InjectModel('Attendance')
    private readonly attendanceModel: Model<Attendance>,
    @InjectModel(Town.name) private townModel: Model<Town>,
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRole>,
    @InjectModel(Draft.name) private draftModel: Model<Draft>,
    @InjectModel(Outlet.name) private outletModel: Model<Outlet>,
    @InjectModel(Region.name) private regionModel: Model<Region>,
    private apiConfigService: ApiConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, kind, nidNumber, email } = createUserDto;
    const user = await this.userModel.findOne({
      username: username.toLowerCase(),
      kind: kind,
    });

    if (user) {
      throw new ForbiddenException(
        'A user has already been created for this username. Please try again with a different username.',
      );
    }
    if (nidNumber) {
      const user = await this.userModel.findOne({
        nidNumber: nidNumber,
      });

      if (user) {
        throw new ForbiddenException(
          'A user has already been created for this NID Number.',
        );
      }
    }
    let userModel: Model<
      | CmUser
      | MsUser
      | WmaUser
      | WmaUser
      | CcUser
      | MtcmUser
      | AgencyUser
      | RcUser
      | AdminUser
    >;

    if (createUserDto.kind === UserType.CM) {
      userModel = this.cmUserModel;
    } else if (createUserDto.kind === UserType.MS) {
      userModel = this.msUserModel;
    } else if (createUserDto.kind === UserType.WMA) {
      userModel = this.wmaUserModel;
    } else if (createUserDto.kind === UserType.CC) {
      userModel = this.ccUserModel;
    } else if (createUserDto.kind === UserType.DFF) {
      userModel = this.dffUserModel;
    } else if (createUserDto.kind === UserType.AGENCY) {
      userModel = this.agencyUserModel;
    } else if (createUserDto.kind === UserType.MTCM) {
      userModel = this.mtcmUserModel;
    } else if (createUserDto.kind === UserType.RC) {
      userModel = this.rcUserModel;
    } else {
      userModel = this.adminUserModel;
    }

    const saltRounds = this.apiConfigService.getSaltRounds;

    const hash = await bcrypt.hash(createUserDto.password, saltRounds);
    if (createUserDto.password) {
      this.validatePassword(createUserDto.password);
    }

    createUserDto.username = createUserDto.username.toLowerCase();
    if (email) {
      createUserDto.email = createUserDto.email.toLowerCase();
    }

    let data = (
      await userModel.create({ ...createUserDto, password: hash })
    ).toJSON();

    if (createUserDto.kind === UserType.ADMIN) {
      let userRole = (
        await this.userRoleModel.create({
          userId: data._id,
          roleId: createUserDto.roleId,
          regionId: createUserDto.regionId,
          areaId: createUserDto.areaId,
          territoryId: createUserDto.territoryId,
          townId: createUserDto.townId,
          msId: createUserDto.msId,
        })
      ).toJSON();

      data = { ...userRole, ...data };
    }

    return { data, message: 'User created successfully.' };
  }

  async findAll() {
    const data = await this.userModel.find({ deletedAt: null });

    return { data, message: 'Successfully found all users.' };
  }

  async findOne(id: string) {
    const data = await this.userModel.findById(id);

    return { data, message: 'A user was found successfully.' };
  }

  private validatePassword(password: string): void {
    const minLength = 8;

    // Define regex patterns
    const regexPatterns = [
      /[a-z]/, // At least one lowercase letter
      /[A-Z]/, // At least one uppercase letter
      /\d/, // At least one number
      /[!@#$%^&*(),.?":{}|<>]/, // At least one special character
    ];

    // Check password length
    if (password.length < minLength) {
      throw new BadRequestException(
        `Password must be at least ${minLength} characters long.`,
      );
    }

    const unmetCriteria = regexPatterns.filter(
      (regex) => !regex.test(password),
    );

    if (unmetCriteria.length > 0) {
      throw new BadRequestException(
        `Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.`,
      );
    }
  }

  async remove(id: string) {
    const data = await this.userModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      {
        new: true,
      },
    );

    return { data, message: 'User deleted successfully.' };
  }

  async userUnlock(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('No user found to unlock user.');
    }

    const data = await this.userModel.findByIdAndUpdate(
      id,
      {
        attempt: 0,
        locked: false,
      },
      { new: true },
    );

    return { data, message: 'Successfully unlocked user.' };
  }

  async getWhoAmI(user: IUser) {
    let pipeline: mongoose.PipelineStage[];

    if (user.kind === 'Admin') {
      pipeline = [
        {
          $lookup: {
            from: 'permissions',
            localField: 'landingPage',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  _id: 0,
                  label: { $ifNull: ['$submodule', '$module'] },
                  value: '$_id',
                },
              },
            ],
            as: 'landingPage',
          },
        },
        {
          $unwind: {
            path: '$landingPage',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'userroles',
            localField: '_id',
            foreignField: 'userId',
            pipeline: [
              {
                $lookup: {
                  from: 'rolehaspermissions',
                  localField: 'roleId',
                  foreignField: '_id',
                  pipeline: [
                    {
                      $lookup: {
                        from: 'permissions',
                        localField: 'permissions',
                        foreignField: '_id',
                        pipeline: [
                          {
                            $project: {
                              _id: 0,
                              label: { $ifNull: ['$submodule', '$module'] },
                              value: '$_id',
                            },
                          },
                        ],
                        as: 'permissions',
                      },
                    },
                  ],
                  as: 'rolehaspermission',
                },
              },
              {
                $unwind: {
                  path: '$rolehaspermission',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'userrole',
          },
        },
        {
          $unwind: {
            path: '$userrole',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            permission: '$userrole.rolehaspermission.permissions',
            projectAccess: '$userrole.projectAccess',
            group: '$userrole.rolehaspermission.name',
          },
        },
        { $project: { userrole: 0 } },
      ];
    } else {
      const { startOfToday, endOfToday } = startAndEndOfDate(new Date());
      pipeline = [
        {
          $lookup: {
            from: 'towns',
            localField: 'town',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  _id: 0,
                  id: '$_id',
                  name: '$name',
                  towncode: '$towncode',
                  lat: '$lat',
                  lon: '$lon',
                  territory: '$territory',
                  territoryId: '$territoryId',
                  area: '$area',
                  areaId: '$areaId',
                  region: '$region',
                  regionId: '$regionId',
                },
              },
            ],
            as: 'town',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'supervisor',
            foreignField: '_id',
            pipeline: [{ $project: { _id: 0, id: '$_id', name: '$name' } }],
            as: 'supervisor',
          },
        },
        {
          $unwind: {
            path: '$supervisor',
            preserveNullAndEmptyArrays: true,
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
                },
              },
            ],
            as: 'attendance',
          },
        },
        {
          $unwind: {
            path: '$attendance',
            preserveNullAndEmptyArrays: true,
          },
        },
      ];
    }

    let userData: any = await this.userModel.aggregate([
      {
        $match: {
          _id: user._id,
        },
      },
      {
        $project: {
          password: false,
        },
      },
      ...pipeline,
      {
        $project: {
          password: 0,
          locked: 0,
          attempt: 0,
          modifier: 0,
          deletedAt: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
    ]);
    if (user.kind === UserType.MTCM) {
      const townIds = userData[0]?.town?.map((t) => new Types.ObjectId(t.id));
      const outlets = await this.outletModel.find({
        'town.id': { $in: townIds },
        'user.usercode': user.usercode,
        deletedAt: null,
      });
      userData[0].outlets = outlets;
    }
    return { data: userData[0] };
  }

  async getTowns(user: IUser) {
    const userData = await this.userModel.aggregate([
      {
        $match: {
          _id: user._id,
          deletedAt: null,
        },
      },
      {
        $project: {
          town: 1,
        },
      },
    ]);
    return { data: { towns: userData[0]?.town } };
  }

  async cmListForSupervisor(user: IUser) {
    const data = await this.userModel.aggregate([
      {
        $match: {
          supervisor: user._id,
          kind: UserType.CM,
          deletedAt: null,
        },
      },
      {
        $project: {
          password: false,
        },
      },
      {
        $facet: {
          data: [
            {
              $project: {
                _id: 0,
                userId: '$_id',
                name: 1,
                usercode: 1,
              },
            },
          ],
          meta: [{ $count: 'total' }],
        },
      },
    ]);

    const meta = {
      total: data[0]?.meta[0]?.total,
    };

    return { data: data[0]?.data, meta };
  }

  async searchEmployee(query: SearchEmployee, user: any) {
    const {
      regionId,
      areaId,
      territoryId,
      townId,
      supervisorId,
      type,
      employeeCode,
      employeeName,
      employeeUsername,
      idLock,
      status,
      nidNo,
      employeeEmail,
      actionType,
    } = query;

    const page = +query.page > 0 ? +query.page : 1;
    const limit = +query.limit > 0 ? +query.limit : 500; // get all data
    const skip = limit * (page - 1);

    const filterQuery: any = {};
    let townQuery: any = {};
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
        user?.townsId,
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
        townQuery = { town: { $in: result[0]?.town } };
      }
    }

    let filterUserForMs: any = {};
    if (user?.msId?.length > 0) {
      filterUserForMs['$or'] = [
        { supervisor: { $in: user.msId } },
        { _id: { $in: user.msId } },
      ];
    }
    if (
      supervisorId &&
      typeof supervisorId === 'object' &&
      supervisorId.length
    ) {
      filterQuery['supervisor'] = {
        $in: supervisorId.map((v) => new Types.ObjectId(v)),
      };
    }

    if (employeeName) {
      filterQuery['name'] = new RegExp(employeeName, 'i');
    }
    if (employeeCode) {
      filterQuery['usercode'] = new RegExp(employeeCode, 'i');
    }
    if (employeeUsername) {
      filterQuery['username'] = new RegExp(employeeUsername, 'i');
    }

    if (idLock) {
      if (idLock === 'yes') {
        filterQuery['locked'] = true;
      } else if (idLock === 'no') {
        filterQuery['locked'] = false;
      }
    }

    if (type) {
      if (typeof type === 'string') filterQuery['kind'] = type;
      else {
        filterQuery['kind'] = { $in: type };
      }
    } else {
      filterQuery['kind'] = { $ne: UserType.ADMIN };
    }
    if (status) {
      if (status === 'locked') {
        filterQuery['locked'] = true;
      } else {
        filterQuery['deletedAt'] =
          status === 'active' ? { $eq: null } : { $ne: null };
      }
    }
    if (nidNo) {
      filterQuery['nidNumber'] = nidNo;
    }

    if (employeeEmail) {
      filterQuery['email'] = new RegExp(employeeEmail, 'i');
    }
    if (actionType) {
      if (actionType === 'Resignation') {
        filterQuery['resignation'] = { $exists: true };
      } else if (actionType === 'Terminated') {
        filterQuery['termination'] = { $exists: true };
      } else if (actionType === 'Warning') {
        filterQuery['warning'] = { $exists: true };
      }
    }
    const [{ data = [], meta = {} } = {}] = await this.userModel.aggregate([
      {
        $match: {
          ...townQuery,
          ...filterUserForMs,
          ...filterQuery,
        },
      },
      {
        $facet: {
          data: [
            {
              $addFields: {
                sortOrder: { $cond: [{ $eq: ['$deletedAt', null] }, 0, 1] },
              },
            },
            {
              $sort: { sortOrder: 1, _id: 1 },
            },
            { $skip: skip },
            { $limit: limit },
            {
              $addFields: {
                status: {
                  $cond: [{ $ne: ['$deletedAt', null] }, 'inactive', 'active'],
                },
              },
            },
            {
              $lookup: {
                from: 'towns',
                localField: 'town',
                foreignField: '_id',
                as: 'towns',
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'supervisor',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      name: 1,
                      usercode: 1,
                    },
                  },
                ],
                as: 'supervisor',
              },
            },
            {
              $unwind: {
                path: '$supervisor',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                town: 0,
              },
            },
          ],
          meta: [{ $count: 'total' }],
        },
      },
      {
        $unwind: { path: '$meta' },
      },
    ]);

    const res = {
      data,
      meta: { page, limit, ...meta },
    };
    return res;
  }

  async getUserTownsWithLabelAndValue(userId: string, userType: string) {
    const query = { deletedAt: null };

    if (userId) {
      query['_id'] = new Types.ObjectId(userId);
    }

    if (userType) {
      query['kind'] = userType;
    }

    const townsWithLabelAndValue = await this.userModel.aggregate([
      {
        $match: {
          ...query,
        },
      },
      {
        $lookup: {
          from: 'towns',
          localField: 'town',
          foreignField: '_id',
          as: 'alltowns',
        },
      },
      {
        $unwind: {
          path: '$alltowns',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          label: '$alltowns.name',
          value: '$alltowns._id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { label: 1 },
      },
    ]);

    return {
      data: townsWithLabelAndValue,
    };
  }

  async usersList(dto: FilterUserByKindDto) {
    const { kind } = dto;
    const query: any = {};

    if (!kind) {
      query['kind'] = { $ne: UserType.ADMIN };
    }
    if (kind && typeof kind === 'string') query['kind'] = kind;
    if (kind && Array.isArray(kind)) query['kind'] = { $in: kind };

    const users = await this.userModel.aggregate([
      {
        $match: {
          ...query,
        },
      },
      {
        $project: {
          _id: 0,
          label: '$name',
          value: '$_id',
          kind: '$kind',
        },
      },
    ]);
    return { data: users, message: 'Employee List found successfully' };
  }
}
