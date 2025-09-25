import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Execution } from '../execution/schema/execution.schema';
import { ExecutionCallType } from '../execution/interface/execution-call.type';
import { IUser } from '../user/interfaces/user.interface';
import { startAndEndOfDate } from 'src/utils/utils';
import { UserType } from '../user/interfaces/user.type';
import { JobType } from '../execution/interface/job.type';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
@Injectable()
export class AiReportService {
  constructor(
    @InjectModel(Execution.name)
    private readonly executionModel: Model<Execution>,
    @InjectQueue('execution-image') private executionImageQueue: Queue,
  ) {}

  async aiExecutionResult(user: IUser) {
    const { startOfToday, endOfToday } = startAndEndOfDate(new Date());
    if (user?.kind !== UserType.MTCM) {
      const list = await this.executionModel.aggregate([
        {
          $match: {
            'town.id': { $in: user.town },
            'user.id': user._id,
            executionEndAt: {
              $gte: startOfToday,
              $lte: endOfToday,
            },
            callType: { $ne: ExecutionCallType.NO },
          },
        },
        {
          $project: {
            _id: 0,
            executionId: '$_id',
            outlet: 1,
            passed: '$passed',
            isAiReady: 1,
          },
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'executionId',
            foreignField: 'executionId',
            as: 'jobs',
          },
        },
      ]);
      return { data: list };
    } else {
      const list = await this.executionModel.aggregate([
        {
          $match: {
            'town.id': { $in: user.town },
            'user.id': user._id,
            executionEndAt: {
              $gte: startOfToday,
              $lte: endOfToday,
            },
            callType: { $ne: ExecutionCallType.NO },
          },
        },
        {
          $project: {
            _id: 0,
            executionId: '$_id',
            outlet: 1,
            passed: '$passed',
            isAiReady: 1,
          },
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'executionId',
            foreignField: 'executionId',
            as: 'jobs',
          },
        },
      ]);
      return { data: list };
    }
  }

  async aiExecutionResultV2(user: IUser) {
    const { startOfToday, endOfToday } = startAndEndOfDate(new Date());
    if (user?.kind !== UserType.MTCM) {
      const list = await this.executionModel.aggregate([
        {
          $match: {
            'town.id': { $in: user.town },
            'user.id': user._id,
            executionEndAt: {
              $gte: startOfToday,
              $lte: endOfToday,
            },
            callType: { $ne: ExecutionCallType.NO },
          },
        },
        {
          $project: {
            _id: 0,
            executionId: '$_id',
            outlet: 1,
            passed: '$passed',
            isAiReady: 1,
            totalAiRun: 1,
            image: 1,
            //confidence: 1,
            //confidenceScore: 1,
            challengeRequestDisplays: 1,
            retakeDisplays: 1,
            challengedBy: 1,
            challengeRequestRemarks: [
              'Overall Compliance',
              'Variant Compliance',
              'Shelf-Talker Visibility',
              'Planogram Adherence',
              'Exclusivity',
            ],
            reviewedAIResult: 1,
            skipChallenge: [],
          },
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'executionId',
            foreignField: 'executionId',
            as: 'jobs',
          },
        },
        {
          $lookup: {
            from: 'plannedquantities',
            localField: 'jobs.planogram.slab',
            foreignField: 'slab',
            pipeline: [
              {
                $project: {
                  planogram: 1,
                  slab: 1,
                  image: 1,
                },
              },
            ],
            as: 'pg_samples',
          },
        },
      ]);

      list.forEach(({ jobs }) => {
        const displayAuditJob = jobs.find(
          (job) => job.name === JobType.DISPLAY_AUDIT,
        );

        if (displayAuditJob) {
          displayAuditJob.planogram.forEach((pg) => {
            const isWithin15Min =
              !!pg.lastUpdatedAt &&
              dayjs().diff(pg.lastUpdatedAt, 'minute') <= 15;

            pg.retakeButton =
              pg.retakeEligible &&
              !pg.challengeRequest &&
              (!pg.retakeCount || pg.retakeCount < 2) &&
              isWithin15Min;
          });
        }
      });
      return { data: list };
    } else {
      const list = await this.executionModel.aggregate([
        {
          $match: {
            'town.id': { $in: user.town },
            'user.id': user._id,
            executionEndAt: {
              $gte: startOfToday,
              $lte: endOfToday,
            },
            callType: { $ne: ExecutionCallType.NO },
          },
        },
        {
          $project: {
            _id: 0,
            executionId: '$_id',
            outlet: 1,
            passed: '$passed',
            isAiReady: 1,
          },
        },
        {
          $lookup: {
            from: 'jobs',
            localField: 'executionId',
            foreignField: 'executionId',
            as: 'jobs',
          },
        },
      ]);
      return { data: list };
    }
  }
}
