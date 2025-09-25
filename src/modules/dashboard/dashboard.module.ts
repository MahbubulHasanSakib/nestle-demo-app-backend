import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TownModule } from '../data-management/town/town.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { LeaveModule } from '../leave/leave.module';
import { UserModule } from '../user/user.module';
import { ExecutionModule } from '../execution/execution.module';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { RouteModule } from '../route/route.module';
@Module({
  imports: [
    AuthModule,
    ExecutionModule,
    TownModule,
    AttendanceModule,
    LeaveModule,
    UserModule,
    RouteModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
