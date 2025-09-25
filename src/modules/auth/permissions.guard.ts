import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PermissionType } from './interface/permission.type';
import { AuthService } from './auth.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const permissions = this.reflector.getAllAndOverride<PermissionType[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );
    if (!permissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request?.user?._id;

    if (!userId) {
      throw new UnauthorizedException();
    }

    const roleHasPermission =
      await this.authService.findRoleHasPermissionByUserId(userId?.toString());

    const permissionSet = new Set(roleHasPermission.permissions);

    const isPermit = permissions.some((permission) =>
      permissionSet.has(permission),
    );

    const canAccess = [
      PermissionType.DATA_MANAGEMENT,
      PermissionType.LEAVE_APPROVAL,
      PermissionType.VIEW_EMPLOYEE,
    ].some((permission) => permissions.includes(permission));

    if (!isPermit && !canAccess) {
      throw new UnauthorizedException();
    }

    request.user = {
      ...request.user,
      msId: roleHasPermission.msId,
      townsId: roleHasPermission.townsId,
      projectAccess: roleHasPermission.projectAccess,
    };

    return true;
  }
}
