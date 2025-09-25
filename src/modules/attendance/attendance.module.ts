import { Module, forwardRef } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceSchema } from './schema/attendance.schema';
import { UserSchema } from '../user/schemas/user.schema';
import { TownModule } from '../data-management/town/town.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TownModule,
    MongooseModule.forFeature([
      {
        name: 'Attendance',
        schema: AttendanceSchema,
      },
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [MongooseModule, AttendanceService],
})
export class AttendanceModule {}
