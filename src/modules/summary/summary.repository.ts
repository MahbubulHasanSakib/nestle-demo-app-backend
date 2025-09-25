import { Model } from 'mongoose';
import { TownSummary, UserSummary } from './schema/summary.schema';

export class SummaryRepository<
  TownSummaryDocument extends TownSummary,
  UserSummaryDocument extends UserSummary,
> {
  private readonly townSummaryModel: Model<TownSummaryDocument>;
  private readonly userSummaryModel: Model<UserSummaryDocument>;

  constructor(options: {
    townSummaryModel?: Model<TownSummaryDocument>;
    userSummaryModel?: Model<UserSummaryDocument>;
  }) {
    this.townSummaryModel = options.townSummaryModel;
    this.userSummaryModel = options.userSummaryModel;
  }

  async getTownSummary(
    filterQuery: any,
    skip: number,
    limit: number,
  ): Promise<{ data: TownSummary[]; pageCount: number }> {
    try {
      const [entities, total] = await Promise.all([
        this.townSummaryModel.find(filterQuery).skip(skip).limit(limit).exec(),
        this.townSummaryModel.countDocuments(filterQuery).exec(),
      ]);

      const pageCount = Math.ceil(total / limit);

      return { data: entities, pageCount };
    } catch (error) {
      throw new Error(`Error getting all entities: ${error.message}`);
    }
  }

  async getUserSummary(
    filterQuery: any,
    skip: number,
    limit: number,
  ): Promise<{ data: UserSummary[]; pageCount: number }> {
    try {
      const [entities, total] = await Promise.all([
        this.userSummaryModel.find(filterQuery).skip(skip).limit(limit).exec(),
        this.userSummaryModel.countDocuments(filterQuery).exec(),
      ]);

      const pageCount = Math.ceil(total / limit);

      return { data: entities, pageCount };
    } catch (error) {
      throw new Error(`Error getting all entities: ${error.message}`);
    }
  }
}
