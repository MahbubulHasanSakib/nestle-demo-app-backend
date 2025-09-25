import { Model } from 'mongoose';
import { Town } from './town/schema/town.schema';
import { GetDataManagementDto } from './dto/get-data-management.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { IUser } from '../user/interfaces/user.interface';

export class DataManagementService {
  constructor(
    @InjectModel(Town.name) private readonly townModel: Model<Town>,
  ) {}

  async findAll(dto: GetDataManagementDto, user: IUser) {
    let keys: string[] = [];

    let filterQuery = {};

    if (user.townsId && user.townsId.length) {
      filterQuery = { ...filterQuery, _id: { $in: user.townsId } };
    }

    if (dto.townId && dto.townId.length) {
      keys = ['name'];

      filterQuery = {
        ...filterQuery,
        _id: { $in: dto.townId.map((id) => new ObjectId(id)) },
      };
    } else if (dto.territoryId && dto.territoryId.length) {
      keys = ['name'];

      filterQuery = {
        ...filterQuery,
        territoryId: { $in: dto.territoryId.map((id) => new ObjectId(id)) },
      };
    } else if (dto.areaId && dto.areaId.length) {
      keys = ['territory', 'name'];

      filterQuery = {
        ...filterQuery,
        areaId: { $in: dto.areaId.map((id) => new ObjectId(id)) },
      };
    } else if (dto.regionId && dto.regionId.length) {
      keys = ['area', 'territory', 'name'];

      filterQuery = {
        ...filterQuery,
        regionId: { $in: dto.regionId.map((id) => new ObjectId(id)) },
      };
    } else {
      keys = ['region', 'area', 'territory', 'name'];
    }

    const buildGroupQuery = keys.reduce(
      (acc, key) => ({
        ...acc,
        [key === 'name' ? 'townList' : `${key}List`]: {
          $addToSet: {
            label: `$${key}`,
            value: key === 'name' ? '$_id' : `$${key}Id`,
          },
        },
      }),
      {},
    );

    const data =
      (
        await this.townModel.aggregate([
          { $match: { ...filterQuery, deletedAt: null } },
          { $group: { _id: null, ...buildGroupQuery } },
          { $project: { _id: 0 } },
        ])
      )[0] ?? {};

    return {
      data,
      message: 'Data Management Data has been found successfully.',
    };
  }
}
