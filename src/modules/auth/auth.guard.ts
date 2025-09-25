import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import mongoose, { Model } from 'mongoose';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';
import { User } from '../user/schemas/user.schema';
import { AdminUser } from '../user/schemas/admin-user.schema';
import { CmUser } from '../user/schemas/cm-user.schema';
import { MsUser } from '../user/schemas/ms-user.schema';
import { UserType } from '../user/interfaces/user.type';
import { IUser } from '../user/interfaces/user.interface';
import { WmaUser } from '../user/schemas/wma-user.schema';
import { DffUser } from '../user/schemas/dff-user.schema';
import { CcUser } from '../user/schemas/cc-user.schema';
import { MtcmUser } from '../user/schemas/mtcm-user.schema';
import { AgencyUser } from '../user/schemas/agency-user.schema';
import { RcUser } from '../user/schemas/rc-user.schema';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(CmUser.name) private cmUserModel: Model<CmUser>,
    @InjectModel(MsUser.name) private msUserModel: Model<MsUser>,
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUser>,
    @InjectModel(WmaUser.name) private wmaUserModel: Model<WmaUser>,
    @InjectModel(DffUser.name) private dffUserModel: Model<DffUser>,
    @InjectModel(CcUser.name) private ccUserModel: Model<CcUser>,
    @InjectModel(MtcmUser.name) private mtcmUserModel: Model<MtcmUser>,
    @InjectModel(AgencyUser.name) private agencyUserModel: Model<AgencyUser>,
    @InjectModel(RcUser.name) private rcUserModel: Model<RcUser>,
    private jwtService: JwtService,
    private apiConfigService: ApiConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No tokens found.');
    }

    const secret = this.apiConfigService.getJwtSecret;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

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

      if (payload.kind === UserType.CM) {
        userModel = this.cmUserModel;
      } else if (payload.kind === UserType.MS) {
        userModel = this.msUserModel;
      } else if (payload.kind === UserType.WMA) {
        userModel = this.wmaUserModel;
      } else if (payload.kind === UserType.CC) {
        userModel = this.ccUserModel;
      } else if (payload.kind === UserType.DFF) {
        userModel = this.dffUserModel;
      } else if (payload.kind === UserType.AGENCY) {
        userModel = this.agencyUserModel;
      } else if (payload.kind === UserType.MTCM) {
        userModel = this.mtcmUserModel;
      } else if (payload.kind === UserType.RC) {
        userModel = this.rcUserModel;
      } else {
        userModel = this.adminUserModel;
      }

      const user = <IUser>(
        (await userModel.findOne({ _id: payload.sub })).toObject()
      );

      if (user.kind !== UserType.ADMIN) {
        if (user.device.id !== payload.device.id) {
          throw new ForbiddenException(
            'You do not have permission to access this route.',
          );
        }
      }

      request['user'] = user;
    } catch (error) {
      if (error) {
        throw error;
      } else {
        throw new UnauthorizedException('The token you provided is invalid.');
      }
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
