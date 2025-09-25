import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaveSchema } from './schema/leave.schema';
import { UserSchema } from '../user/schemas/user.schema';
import { TownModule } from '../data-management/town/town.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TownModule,
    AttendanceModule,
    MongooseModule.forFeature([
      {
        name: 'Leave',
        schema: LeaveSchema,
      },
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [MongooseModule],
})
export class LeaveModule {}
