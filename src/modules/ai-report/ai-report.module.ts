import { Module, forwardRef } from '@nestjs/common';
import { AiReportService } from './ai-report.service';
import { AiReportController } from './ai-report.controller';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { ExecutionProcessor } from './processor/execution.processor';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import {
  Execution,
  ExecutionSchema,
} from '../execution/schema/execution.schema';
import { ExecutionModule } from '../execution/execution.module';
import { OutletModule } from '../outlet/outlet.module';

@Module({
  imports: [
    forwardRef(() => ExecutionModule),
    BullModule.registerQueue({
      name: 'execution-image',
    }),
    HttpModule,
    OutletModule,
  ],
  controllers: [AiReportController],
  providers: [AiReportService, ExecutionProcessor],
  exports: [BullModule, ExecutionProcessor],
})
export class AiReportModule {}
