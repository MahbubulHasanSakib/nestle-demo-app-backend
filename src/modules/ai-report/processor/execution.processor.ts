import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  OnQueueStalled,
  OnQueueWaiting,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { AiReportService } from '../ai-report.service';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Execution } from 'src/modules/execution/schema/execution.schema';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';
import { JobType } from 'src/modules/execution/interface/job.type';
import {
  applyShelvingNorm,
  calculateSOVMStats,
  checkOverAllSlotAdherencePassed,
  processMTSOS,
  processMaterialsFromArray,
  processPOSM,
  processPlanogram,
  processSOS,
  processSOSShare,
  processSachetShare,
} from '../helper/helper';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  applicableChallenge,
  compliancePassCheckForAllSlab,
  compliancePassCheckForAnySlab,
  exclusivityPassCheckForAllSlab,
  modifyPass,
  planogramAdherencePassCheckForAllSlab,
  setPGLastUpdatedAt,
  setRetakeEligible,
  shelfTalkerPassCheckForAllSlab,
  startAndEndOfDate,
} from 'src/utils/utils';
import { Outlet } from 'src/modules/outlet/schema/outlet.schema';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

@Processor('execution-image')
export class ExecutionProcessor {
  constructor(
    private readonly aiReportService: AiReportService,
    @InjectModel(Execution.name)
    private readonly executionModel: Model<Execution>,
    @InjectModel(Outlet.name)
    public readonly outletModel: Model<Outlet>,
    private apiConfigService: ApiConfigService,
  ) {}

  private thresholdData: any;

  @Process({ concurrency: 10 })
  async uploadExecutionImages(job: Job) {
    const {
      execution,
      allJobs,
      jobName,
      slabName,
      displayName,
      PreImage,
      triggeredFor,
      retakeJobName,
    } = job.data;
    const executionId = execution._id;
    const baseUrl = this.apiConfigService.getAiBaseUrl;
  }
}
