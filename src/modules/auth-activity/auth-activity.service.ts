import { Injectable } from '@nestjs/common';
import { CreateAuthActivityDto } from './dto/create-auth-activity.dto';
import { UpdateAuthActivityDto } from './dto/update-auth-activity.dto';
import { GetAuthActivities } from './dto/get-auth-activity.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AuthActivity } from './schemas/auth-activity.schema';
import { Model, Types } from 'mongoose';
import { startAndEndOfDate } from 'src/utils/utils';

@Injectable()
export class AuthActivityService {
  constructor(
    @InjectModel(AuthActivity.name)
    private readonly authActivityModel: Model<AuthActivity>,
  ) {}

  async create(createAuthActivityDto: CreateAuthActivityDto) {
    return 'This action adds a new authActivity';
  }

  async findAll(query: GetAuthActivities) {
    const limit = +query.limit > 0 ? +query.limit : 20;
    const page = +query.page > 0 ? +query.page : 1;
    const skip = limit * (page - 1);
    const { userId, from, to, name } = query;
    const { startOfToday, endOfToday } = startAndEndOfDate(new Date());
    let filterQuery: any = {};
    let dayQuery: any = {
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    };
    if (userId) {
      filterQuery['user.id'] = new Types.ObjectId(userId);
    }

    if (name) {
      filterQuery['user.name'] = name;
    }

    if (from) {
      const { startOfToday: startDate } = startAndEndOfDate(from);
      dayQuery = {
        createdAt: {
          ...dayQuery.createdAt,
          $gte: startDate,
        },
      };
    }

    if (to) {
      const { endOfToday: endDate } = startAndEndOfDate(to);
      dayQuery = {
        createdAt: {
          ...dayQuery.createdAt,
          $lte: endDate,
        },
      };
    }

    const [{ data = [], meta = {} } = {}] =
      await this.authActivityModel.aggregate([
        {
          $match: {
            ...filterQuery,
            ...dayQuery,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            meta: [{ $count: 'total' }],
          },
        },
        {
          $unwind: { path: '$meta' },
        },
      ]);

    return {
      data,
      meta: {
        page,
        limit,
        ...meta,
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} authActivity`;
  }

  update(id: number, updateAuthActivityDto: UpdateAuthActivityDto) {
    return `This action updates a #${id} authActivity`;
  }

  remove(id: number) {
    return `This action removes a #${id} authActivity`;
  }
}
