import { Module, forwardRef } from '@nestjs/common';
import { ExecutionController } from './execution.controller';
import { ExecutionService } from './execution.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Execution, ExecutionSchema } from './schema/execution.schema';
import {
  Attendance,
  AttendanceSchema,
} from '../attendance/schema/attendance.schema';

import { BullModule } from '@nestjs/bull';
import { TownModule } from '../data-management/town/town.module';
import { OutletModule } from '../outlet/outlet.module';
import { AuthModule } from '../auth/auth.module';
import { Material, MaterialSchema } from '../material/schema/material.schema';
import { AiReportModule } from '../ai-report/ai-report.module';
import {
  MaterialAssignment,
  MaterialAssignmentSchema,
} from '../material/schema/material-assignment.schema';
@Module({
  imports: [
    AuthModule,
    TownModule,
    OutletModule,
    forwardRef(() => AiReportModule),
    MongooseModule.forFeature([
      { name: Execution.name, schema: ExecutionSchema },

      {
        name: Attendance.name,
        schema: AttendanceSchema,
      },
      {
        name: Material.name,
        schema: MaterialSchema,
      },
      {
        name: MaterialAssignment.name,
        schema: MaterialAssignmentSchema,
      },
    ]),
  ],
  controllers: [ExecutionController],
  providers: [ExecutionService],
  exports: [MongooseModule],
})
export class ExecutionModule {}
