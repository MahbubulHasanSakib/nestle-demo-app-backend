import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Territory } from './schema/territory.schema';
import { TerritoryRepository } from './territory.repository';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';
import { Constants } from 'src/utils/constants';
import { ResponseUtils } from 'src/utils/response.utils';
import { Area } from '../area/schema/area.schema';
import { GetTerritoryDto } from './dto/get-territory.dto';

@Injectable()
export class TerritoryService {
  constructor(
    @InjectModel(Area.name)
    private readonly areaModel: Model<Area>,
    @InjectModel(Territory.name)
    private readonly territoryModel: Model<Territory>,
  ) {}

  private readonly territoryRepository = new TerritoryRepository(
    this.territoryModel,
  );

  async create(dto: CreateTerritoryDto): Promise<any> {
    try {
      const area = await this.areaModel.findById(dto.areaId);

      const data = await this.territoryModel.create({
        region: area.region,
        regionId: area.regionId,
        area: area.name,
        areaId: area._id,
        name: dto.name,
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

  async update(id: string, dto: UpdateTerritoryDto): Promise<any> {
    try {
      const data = await this.territoryRepository.updateEntity(id, dto);
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
      const data = await this.territoryRepository.getEntityById(id);
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

  async getAll(getTerritoryDto: GetTerritoryDto): Promise<any> {
    const { regionId, areaId, territoryId, page, limit } = getTerritoryDto;

    let filter: Record<string, unknown> = {};

    if (regionId) {
      filter = { ...filter, regionId };
    }

    if (areaId) {
      filter = { ...filter, areaId };
    }

    if (territoryId) {
      filter = { ...filter, _id: territoryId };
    }

    try {
      const data = await this.territoryModel
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
      const result = await this.territoryRepository.deleteEntity(id);
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
}
