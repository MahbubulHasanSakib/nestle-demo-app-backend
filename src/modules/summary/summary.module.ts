import { SummaryKind } from './interfaces/summary-kind.type';
import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Summary,
  SummarySchema,
  TownSummary,
  TownSummarySchema,
  UserSummary,
  UserSummarySchema,
} from './schema/summary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Summary.name,
        schema: SummarySchema,
        discriminators: [
          {
            name: TownSummary.name,
            schema: TownSummarySchema,
            value: SummaryKind.TOWN,
          },
          {
            name: UserSummary.name,
            schema: UserSummarySchema,
            value: SummaryKind.USER,
          },
        ],
      },
    
    ]),
  ],
  controllers: [SummaryController],
  providers: [SummaryService],
  exports: [MongooseModule],
})
export class SummaryModule {}
