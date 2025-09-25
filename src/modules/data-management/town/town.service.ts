import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Town } from './schema/town.schema';
import { TownRepository } from './town.repository';
import { CreateTownDto } from './dto/create-town.dto';
import { UpdateTownDto } from './dto/update-town.dto';
import { Constants } from 'src/utils/constants';
import { ResponseUtils } from 'src/utils/response.utils';
import { Route } from 'src/modules/route/schema/route.schema';
import { Territory } from '../territory/schema/territory.schema';
import { GetTownDto } from './dto/get-town.dto';
import { startAndEndBetweenSixDays } from 'src/utils/utils';

@Injectable()
export class TownService {
  constructor(
    @InjectModel(Territory.name)
    private readonly territoryModel: Model<Territory>,
    @InjectModel(Town.name) private readonly townModel: Model<Town>,
    @InjectModel(Route.name) private readonly routeModel: Model<Route>,
  ) {}

  private readonly townRepository = new TownRepository(this.townModel);

  async create(dto: CreateTownDto): Promise<any> {
    try {
      const territory = await this.territoryModel.findById(dto.territoryId);

      const data = await this.townModel.create({
        region: territory.region,
        regionId: territory.regionId,
        area: territory.area,
        areaId: territory.areaId,
        territory: territory.name,
        territoryId: territory._id,
        towncode: dto.towncode,
        name: dto.name,
        lat: dto.lat,
        lon: dto.lon,
      });

      if (!data) {
        throw new BadRequestException(Constants.CREATE_FAILED);
      }
      return ResponseUtils.successResponseHandler(
        201,
        'Successfully created data',
        'data',
        data,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async update(id: string, dto: UpdateTownDto): Promise<any> {
    try {
      const data = await this.townRepository.updateEntity(id, dto);
      if (!data) {
        throw new NotFoundException(Constants.NOT_FOUND);
      }
      return ResponseUtils.successResponseHandler(
        200,
        'Successfully updated data',
        'data',
        data,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getById(id: string): Promise<any> {
    try {
      const data = await this.townRepository.getEntityById(id);
      if (!data) {
        throw new NotFoundException(Constants.NOT_FOUND);
      }
      return ResponseUtils.successResponseHandler(
        200,
        'Successfully retrieved data',
        'data',
        data,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getAll(getTownDto: GetTownDto): Promise<any> {
    const { regionId, areaId, territoryId, townId, page, limit } = getTownDto;

    let filter: Record<string, unknown> = {};

    if (regionId) {
      filter = { ...filter, regionId };
    }

    if (areaId) {
      filter = { ...filter, areaId };
    }

    if (territoryId) {
      filter = { ...filter, territoryId };
    }

    if (townId) {
      filter = { ...filter, _id: townId };
    }

    try {
      const data = await this.townModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit);

      return ResponseUtils.successResponseHandler(
        200,
        'Successfully retrieved data',
        'data',
        data,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async delete(id: string): Promise<any> {
    try {
      const result = await this.townRepository.deleteEntity(id);
      if (!result) {
        throw new NotFoundException(Constants.NOT_FOUND);
      }
      return ResponseUtils.successResponseHandler(
        200,
        'Successfully deleted data',
        'deleted',
        true,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async routesOfTown(towncode: string) {
    const { firstDate, lastDate } = startAndEndBetweenSixDays(new Date());
    const routes = await this.routeModel.aggregate([
      {
        $match: {
          towncode: towncode,
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'routeassignments',
          localField: 'routecode',
          foreignField: 'route.routecode',
          pipeline: [
            {
              $match: {
                day: {
                  $gte: firstDate,
                  $lte: lastDate,
                },
                completedOn: null,
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
              },
            },
          ],
          as: 'pendingOutlets',
        },
      },
      {
        $project: {
          name: 1,
          routecode: 1,
          towncode: 1,
          outletCount: 1,
          job: 1,
          pendingOutletCount: {
            $cond: [
              { $gt: [{ $size: '$pendingOutlets' }, 0] },
              { $first: '$pendingOutlets.total' },
              0,
            ],
          },
        },
      },
    ]);
    return { data: routes };
  }
  async townListWithLabelValue() {
    const towns = await this.townModel.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $project: {
          _id: 0,
          label: '$name',
          value: '$_id',
        },
      },
    ]);
    return { data: towns, message: 'Town List found successfully' };
  }
}
