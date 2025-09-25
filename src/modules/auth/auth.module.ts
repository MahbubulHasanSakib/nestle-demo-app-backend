import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import {
  RoleHasPermission,
  RoleHasPermissionSchema,
} from './schemas/role-has-permission.schema';
import { UserModule } from '../user/user.module';
import { UserRole, UserRoleSchema } from './schemas/user-role.schema';
import {
  AuthActivity,
  AuthActivitySchema,
} from '../auth-activity/schemas/auth-activity.schema';


@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: RoleHasPermission.name, schema: RoleHasPermissionSchema },
      { name: UserRole.name, schema: UserRoleSchema },
      { name: AuthActivity.name, schema: AuthActivitySchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [MongooseModule, AuthService],
})
export class AuthModule {}
