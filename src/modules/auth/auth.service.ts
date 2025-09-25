import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from './schemas/permission.schema';
import { RoleHasPermission } from './schemas/role-has-permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreateRoleHasPermissionDto } from './dto/create-role-has-permission.dto';
import { UpdateRoleHasPermissionDto } from './dto/update-role-has-permission.dto';
import { CreateUserSignInDto } from './dto/create-user-signin.dto';
import { CreateUserSignUpDto } from './dto/create-user-signup.dot';
import { User } from '../user/schemas/user.schema';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';
import { JwtService } from '@nestjs/jwt';
import { CmUser } from '../user/schemas/cm-user.schema';
import { MsUser } from '../user/schemas/ms-user.schema';
import { AdminUser } from '../user/schemas/admin-user.schema';
import { UserType } from '../user/interfaces/user.type';
import { Request } from 'express';
import RequestDetails from 'request-details';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import { IUser } from '../user/interfaces/user.interface';
import { WmaUser } from '../user/schemas/wma-user.schema';
import { DffUser } from '../user/schemas/dff-user.schema';
import { CcUser } from '../user/schemas/cc-user.schema';
import { MtcmUser } from '../user/schemas/mtcm-user.schema';
import { AgencyUser } from '../user/schemas/agency-user.schema';
import { RcUser } from '../user/schemas/rc-user.schema';
import { LoggedOnType } from '../user/interfaces/loggedOn.type';
import { UserRole } from './schemas/user-role.schema';
import { PaginateDto } from 'src/utils/dto/paginate.dto';
import { ObjectId } from 'mongodb';
import { AuthActivity } from '../auth-activity/schemas/auth-activity.schema';
import { getRequestSourceData } from 'src/utils/request.helper';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(RoleHasPermission.name)
    private roleHasPermissionModel: Model<RoleHasPermission>,
    @InjectModel(AuthActivity.name)
    private authActivityModel: Model<AuthActivity>,
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
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRole>,
    private apiConfigService: ApiConfigService,
    private jwtService: JwtService,
  ) {}

  // Below are all the permission related services.

  async createPermission(createPermissionDto: CreatePermissionDto) {
    const data = await this.permissionModel.create(createPermissionDto);

    return { data, message: 'Permission created successfully.' };
  }

  async findAllPermission() {
    const data = await this.permissionModel.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $sort: {
          module: 1,
          submodule: 1,
        },
      },
      {
        $group: {
          _id: '$module',
          res: {
            $push: {
              label: { $ifNull: ['$submodule', '$module'] },
              value: '$_id',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: null,
          res: {
            $push: '$res',
          },
        },
      },
    ]);

    return {
      data: data[0]?.res ?? [],
      message: 'All permissions were found successfully.',
    };
  }

  async findPermissionList() {
    const data = await this.permissionModel.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $sort: {
          module: 1,
        },
      },
      {
        $project: {
          _id: 0,
          label: { $ifNull: ['$submodule', '$module'] },
          value: '$_id',
        },
      },
    ]);

    return { data, message: 'All permissions were found successfully.' };
  }

  async findOnePermission(id: string) {
    const data = await this.permissionModel.findById(id);

    return { data, message: 'A permission was successfully fetched.' };
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto) {
    const data = await this.permissionModel.findByIdAndUpdate(
      id,
      updatePermissionDto,
      { new: true },
    );

    if (!data) {
      throw new ForbiddenException('Failed to update permission.');
    }

    return {
      data,
      message: 'A permission update has been completed successfully.',
    };
  }

  async removePermission(id: string) {
    const data = await this.permissionModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!data) {
      throw new ForbiddenException('Failed to delete permission.');
    }

    return {
      data,
      message: 'A permission has been successfully deleted.',
    };
  }

  async createRoleHasPermission(
    createRoleHasPermissionDto: CreateRoleHasPermissionDto,
  ) {
    const roleHasPermissions = await this.roleHasPermissionModel.create(
      createRoleHasPermissionDto,
    );

    return {
      message: 'Successfully created role has permissions',
      data: roleHasPermissions,
    };
  }

  async findAllRoleHasPermission(paginateDto: PaginateDto) {
    const { page, limit } = paginateDto;

    const [{ data = [], meta = {} } = {}] =
      await this.roleHasPermissionModel.aggregate([
        {
          $match: {
            deletedAt: null,
          },
        },
        {
          $lookup: {
            from: 'permissions',
            localField: 'permissions',
            foreignField: '_id',
            as: 'permissions',
          },
        },
        {
          $facet: {
            data: [
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $project: {
                  name: 1,
                  modules: {
                    $substr: [
                      {
                        $reduce: {
                          input: {
                            $sortArray: {
                              input: '$permissions',
                              sortBy: { module: 1, submodule: 1 },
                            },
                          },
                          initialValue: '',
                          in: {
                            $concat: [
                              '$$value',
                              ', ',
                              {
                                $ifNull: ['$$this.submodule', '$$this.module'],
                              },
                            ],
                          },
                        },
                      },
                      2,
                      -1,
                    ],
                  },
                },
              },
              {
                $skip: (page - 1) * limit,
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
      ]);

    return {
      message: 'Successfully found role has permissions',
      data,
      meta: { ...meta, limit, page },
    };
  }

  async findAllRoleHasPermissionList() {
    const roleHasPermissions = await this.roleHasPermissionModel.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $project: {
          _id: 0,
          label: '$name',
          value: '$_id',
        },
      },
    ]);

    return {
      message: 'Successfully found role has permissions',
      data: roleHasPermissions,
    };
  }

  async findOneRoleHasPermission(id: string) {
    const data = await this.roleHasPermissionModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'permissions',
          foreignField: '_id',
          pipeline: [
            { $sort: { module: 1, submodule: 1 } },
            {
              $project: {
                _id: 0,
                label: {
                  $ifNull: ['$submodule', '$module'],
                },
                value: '$_id',
              },
            },
          ],
          as: 'permissions',
        },
      },
      {
        $project: {
          name: 1,
          permissions: 1,
        },
      },
    ]);

    return {
      message: data[0]
        ? 'Successfully found role has permission'
        : "didn't find role has permission",
      data: data[0] ?? [],
    };
  }

  async updateRoleHasPermission(
    id: string,
    updateRoleHasPermissionDto: UpdateRoleHasPermissionDto,
  ) {
    const updatedRoleHasPermission =
      await this.roleHasPermissionModel.findByIdAndUpdate(
        id,
        updateRoleHasPermissionDto,
        { new: true },
      );

    if (!updatedRoleHasPermission) {
      throw new NotFoundException("didn't find role has permision to update!");
    }

    return {
      message: 'Successfully update role has permission',
      data: updatedRoleHasPermission,
    };
  }

  async removeRoleHasPermission(id: string) {
    const deletedRoleHasPermission =
      await this.roleHasPermissionModel.findByIdAndUpdate(
        id,
        {
          deletedAt: new Date(),
        },
        { new: true },
      );

    if (!deletedRoleHasPermission) {
      throw new NotFoundException("didn't find role has permision to delete!");
    }
    return {
      message: 'Successfully delete role has permission',
      data: deletedRoleHasPermission,
    };
  }

  async findRoleHasPermissionByUserId(userId: string) {
    const switchCaseForLookupMatchExpr = [
      ['$regionId', '$$regionId'],
      ['$areaId', '$$areaId'],
      ['$territoryId', '$$territoryId'],
      ['$_id', '$$townId'],
    ].map(([expr1, expr2]) => ({
      case: {
        $gte: [
          {
            $size: expr2,
          },
          1,
        ],
      },
      then: {
        $in: [expr1, expr2],
      },
    }));

    const pipeline = [
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'rolehaspermissions',
          localField: 'roleId',
          foreignField: '_id',
          as: 'rolehaspermission',
        },
      },
      {
        $unwind: '$rolehaspermission',
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'rolehaspermission.permissions',
          foreignField: '_id',
          as: 'permissions',
        },
      },
      {
        $addFields: {
          permissions: {
            $map: {
              input: '$permissions',
              in: { $ifNull: ['$$this.submodule', '$$this.module'] },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'towns',
          let: {
            regionId: '$regionId',
            areaId: '$areaId',
            territoryId: '$territoryId',
            townId: '$townId',
            msId: '$msId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $switch: {
                    branches: [...switchCaseForLookupMatchExpr],
                    default: {
                      $not: [
                        {
                          $anyElementTrue: [
                            {
                              $concatArrays: [
                                '$$regionId',
                                '$$areaId',
                                '$$territoryId',
                                '$$townId',
                                '$$msId',
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: 'towns',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'msId',
          foreignField: '_id',
          as: 'msTownId',
        },
      },
      {
        $project: {
          townsId: {
            $concatArrays: [
              { $map: { input: '$towns', in: '$$this._id' } },
              {
                $reduce: {
                  input: '$msTownId',
                  initialValue: [],
                  in: { $concatArrays: ['$$value', '$$this.town'] },
                },
              },
            ],
          },
          msId: 1,
          projectAccess: 1,
          name: '$rolehaspermission.name',
          permissions: 1,
        },
      },
    ];

    const [roleHasPermission = {}] =
      await this.userRoleModel.aggregate(pipeline);

    return roleHasPermission;
  }

  // Below are the services related to user sign in, sign up and sign out.

  async userSignUp(createUserSignUpDto: CreateUserSignUpDto) {
    const user = await this.userModel.findOne({
      username: createUserSignUpDto.username.toLowerCase(),
      kind: createUserSignUpDto.kind,
    });

    if (user) {
      throw new ForbiddenException(
        'A user has already been created for this username. Please try again with a different username.',
      );
    }

    const saltRounds = this.apiConfigService.getSaltRounds;

    const hash = await bcrypt.hash(createUserSignUpDto.password, saltRounds);

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

    if (createUserSignUpDto.kind === UserType.CM) {
      userModel = this.cmUserModel;
    } else if (createUserSignUpDto.kind === UserType.MS) {
      userModel = this.msUserModel;
    } else if (createUserSignUpDto.kind === UserType.WMA) {
      userModel = this.wmaUserModel;
    } else if (createUserSignUpDto.kind === UserType.CC) {
      userModel = this.ccUserModel;
    } else if (createUserSignUpDto.kind === UserType.DFF) {
      userModel = this.dffUserModel;
    } else if (createUserSignUpDto.kind === UserType.AGENCY) {
      userModel = this.agencyUserModel;
    } else if (createUserSignUpDto.kind === UserType.MTCM) {
      userModel = this.mtcmUserModel;
    } else if (createUserSignUpDto.kind === UserType.RC) {
      userModel = this.rcUserModel;
    } else {
      userModel = this.adminUserModel;
    }

    createUserSignUpDto.username = createUserSignUpDto.username.toLowerCase();
    if (createUserSignUpDto?.email) {
      createUserSignUpDto.email = createUserSignUpDto.email.toLowerCase();
    }

    await userModel.create({
      ...createUserSignUpDto,
      password: hash,
    });

    return { data: null, message: 'User created successfully.' };
  }

  async userSignIn(createUserSignInDto: CreateUserSignInDto, request: Request) {
    if (!createUserSignInDto.lat || !createUserSignInDto.lon)
      throw new BadRequestException(
        'Latitude and Longitude must be provided to login',
      );
    const requestDetails = new RequestDetails(request);

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
    let userType: string;
    let loggedOn = createUserSignInDto.loggedOn;
    let loggedInAs = createUserSignInDto.userType;

    const users = await this.userModel.find({
      username: createUserSignInDto.username,
      kind:
        loggedOn === LoggedOnType.WEB
          ? { $eq: UserType.ADMIN }
          : { $ne: UserType.ADMIN },
    });

    userType = users[0]?.kind;
    if (loggedInAs && !loggedInAs.split(',').includes(userType))
      throw new BadRequestException(`User is invalid`);

    if (userType === UserType.CM) {
      userModel = this.cmUserModel;
    } else if (userType === UserType.MS) {
      userModel = this.msUserModel;
    } else if (userType === UserType.WMA) {
      userModel = this.wmaUserModel;
    } else if (userType === UserType.CC) {
      userModel = this.ccUserModel;
    } else if (userType === UserType.DFF) {
      userModel = this.dffUserModel;
    } else if (userType === UserType.AGENCY) {
      userModel = this.agencyUserModel;
    } else if (userType === UserType.MTCM) {
      userModel = this.mtcmUserModel;
    } else if (userType === UserType.RC) {
      userModel = this.rcUserModel;
    } else {
      userModel = this.adminUserModel;
    }

    let pipeline: mongoose.PipelineStage[];

    if (userType === 'Admin') {
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
                          { $match: { deletedAt: { $eq: null } } },
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
          },
        },
        { $project: { userrole: 0 } },
      ];
    } else {
      const { appVersion, loggedOn } = createUserSignInDto;
      if (loggedOn !== LoggedOnType.WEB && !appVersion)
        throw new BadRequestException(
          `App version is required.Need to use latest app`,
        );

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
      ];
    }

    const userData = await this.userModel.aggregate([
      {
        $match: {
          username: createUserSignInDto.username,
          kind: userType,
          deletedAt: null,
        },
      },
      ...pipeline,
    ]);

    let user = userData[0];

    if (!user) {
      throw new NotFoundException(
        'Sorry, no user found for this username and userType.',
      );
    }

    const isMatch = await bcrypt.compare(
      createUserSignInDto.password,
      user.password,
    );

    const { browser, platform: plat } = getRequestSourceData(request.headers);
    const ip = request.clientIp;
    const _ip = ip.startsWith('::ffff:') ? ip.substring(7) : ip;
    const platform = plat.replaceAll('"', '');
    /*const clientIp = request.clientIp;
    const requestOs = requestDetails.getOs();
    const requestBrowser = requestDetails.getBrowser();
    const requestDevice = requestDetails.getDevice();

     let device: string;
    let browser: string;

    if (requestOs.name === 'Android') {
      device = `${requestDevice.vendor} ${requestDevice.model}`;
    } else {
      device = `${requestOs.name} ${requestOs.version}`;
      browser = `${requestBrowser.name}/${requestBrowser.version}`;
    }*/

    const authActivity = new this.authActivityModel({
      user: { id: user['_id'], userType: user.kind, name: user.name },
      kind: 'Login',
      ip: _ip,
      lat: createUserSignInDto.lat,
      lon: createUserSignInDto.lon,
      device: createUserSignInDto.device?.name ?? platform,
      deviceId: createUserSignInDto.device?.id ?? null,
      appVersion: createUserSignInDto.appVersion ?? null,
      browser,
      success: false,
      at: new Date(),
    });

    if (!isMatch) {
      let attempt = ++user.attempt;

      await authActivity.save();

      if (attempt >= 10) {
        await userModel.findOneAndUpdate(
          {
            username: createUserSignInDto.username,
            kind: userType,
          },
          { $set: { attempt, locked: true } },
        );

        throw new ForbiddenException(
          'Your account has been blocked due to multiple incorrect password attempts.',
        );
      }

      await userModel.findOneAndUpdate(
        {
          username: createUserSignInDto.username,
          kind: userType,
        },
        { $set: { attempt } },
      );

      throw new ForbiddenException('The password you provided is incorrect.');
    }

    if (user.locked) {
      await authActivity.save();

      throw new ForbiddenException(
        'Your account has been blocked due to multiple incorrect password attempts.',
      );
    }

    if (user.attempt > 0) {
      await userModel.findOneAndUpdate(
        {
          username: createUserSignInDto.username,
          kind: userType,
        },
        { $set: { attempt: 0 } },
      );
    }

    if (userType !== UserType.ADMIN) {
      const deviceId = createUserSignInDto.device.id;

      if (user.device && user.device.id !== deviceId) {
        await authActivity.save();

        throw new ForbiddenException(
          `You have already registered in ${user?.device?.name} device. Please contact with your supervisor`,
        );
      }

      if (!user.device) {
        const device = { ...createUserSignInDto.device };

        await userModel.findOneAndUpdate(
          {
            username: createUserSignInDto.username,
            kind: userType,
          },
          { $set: { device } },
        );
        user = { ...user, device };
      }
    }

    authActivity.success = true;

    await authActivity.save();

    const {
      _id: sub,
      password,
      locked,
      attempt,
      modifier,
      deletedAt,
      createdAt,
      updatedAt,
      ...data
    } = user;

    const access_token = await this.jwtService.signAsync({ sub, ...data });

    return {
      data: {
        access_token,
        payload: { id: sub, ...data },
        message: 'You have successfully signed in.',
      },
    };
  }

  async userSignOut(user: IUser, request: Request) {
    let userModel: Model<
      | CmUser
      | MsUser
      | WmaUser
      | DffUser
      | CcUser
      | MtcmUser
      | AgencyUser
      | RcUser
      | AdminUser
    >;

    if (user.kind === UserType.CM) {
      userModel = this.cmUserModel;
    } else if (user.kind === UserType.MS) {
      userModel = this.msUserModel;
    } else if (user.kind === UserType.WMA) {
      userModel = this.wmaUserModel;
    } else if (user.kind === UserType.CC) {
      userModel = this.ccUserModel;
    } else if (user.kind === UserType.DFF) {
      userModel = this.dffUserModel;
    } else if (user.kind === UserType.AGENCY) {
      userModel = this.agencyUserModel;
    } else if (user.kind === UserType.MTCM) {
      userModel = this.mtcmUserModel;
    } else if (user.kind === UserType.RC) {
      userModel = this.rcUserModel;
    } else {
      userModel = this.adminUserModel;
    }

    const found = await userModel.findById(user._id);
    const { browser, platform: plat } = getRequestSourceData(request.headers);
    const ip = request.clientIp;
    const _ip = ip.startsWith('::ffff:') ? ip.substring(7) : ip;
    const platform = plat.replaceAll('"', '');

    const authActivity = await this.authActivityModel.create({
      user: { id: user['_id'], userType: user.kind, name: user.name },
      kind: 'Logout',
      ip: _ip,
      device: user.device?.name ?? platform,
      browser,
      success: false,
      at: new Date(),
    });
    if (!found) {
      throw new ForbiddenException('You are not able to log out.');
    }
    authActivity.success = true;
    await authActivity.save();
    /*if (found.kind !== UserType.ADMIN) {
      const employee = <
        mongoose.HydratedDocument<
          | CmUser
          | MsUser
          | WmaUser
          | DffUser
          | CcUser
          | MtcmUser
          | AgencyUser
          | RcUser
        >
      >found;

      //employee.device = null;

      await found.save();
    }*/
    return { data: null, message: 'You have successfully logged out.' };
  }

  async findAll() {
    const userRoles = await this.userRoleModel.find({ deletedAt: null });

    return { message: 'Successfully found user roles', data: userRoles };
  }
  async findOne(id: string) {
    const userRole = await this.userRoleModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                password: false,
              },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    ]);

    return {
      message: userRole[0]
        ? 'Successfully found user role'
        : "didn't find userRole",
      data: userRole[0],
    };
  }

  async unRegisterUserDevice(userId: string, updatedBy: IUser) {
    const user: any = await this.userModel.findById(userId);

    if (!user)
      throw new NotFoundException('User not found with the specific id');

    user.device = null;
    user.modifier = updatedBy._id;
    await user.save();

    return {
      data: user,
      message: 'Device unregistered successfully',
    };
  }
}
