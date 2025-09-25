import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DataManagementModule } from './modules/data-management/data-management.module';
import { UserModule } from './modules/user/user.module';
import { ApiConfigModule } from './modules/api-config/api-config.module';
import { ApiConfigService } from './modules/api-config/api-config.service';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ExecutionModule } from './modules/execution/execution.module';
import { MaterialModule } from './modules/material/material.module';
import { OutletModule } from './modules/outlet/outlet.module';
import { RouteModule } from './modules/route/route.module';
import { AiReportModule } from './modules/ai-report/ai-report.module';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadModule } from './modules/upload/upload.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuthActivityModule } from './modules/auth-activity/auth-activity.module';
import { LeaveModule } from './modules/leave/leave.module';
import { SummaryModule } from './modules/summary/summary.module';

@Module({
  imports: [
    ApiConfigModule,
    MongooseModule.forRootAsync({
      imports: [ApiConfigModule],
      useFactory: async (apiConfigService: ApiConfigService) => ({
        uri: apiConfigService.getMongodbUri,
      }),
      inject: [ApiConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ApiConfigModule],
      useFactory: async (apiConfigService: ApiConfigService) => ({
        url: apiConfigService.getRedisUri,
      }),
      inject: [ApiConfigService],
    }),
    DataManagementModule,
    UserModule,
    AuthModule,
    CoreModule,
    AttendanceModule,
    LeaveModule,
    ExecutionModule,
    MaterialModule,
    OutletModule,
    RouteModule,
    AiReportModule,
    SummaryModule,
    ScheduleModule.forRoot(),
    UploadModule,
    DashboardModule,
    AuthActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {}
}
