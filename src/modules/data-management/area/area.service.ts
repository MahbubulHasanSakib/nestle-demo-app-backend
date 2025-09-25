import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Area } from './schema/area.schema';
import { AreaRepository } from './area.repository';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Constants } from 'src/utils/constants';
import { ResponseUtils } from 'src/utils/response.utils';
import { Region } from '../region/schema/region.schema';
import { GetAreaDto } from './dto/get-area.dto';

@Injectable()
export class AreaService {
  constructor(
    @InjectModel(Region.name) private readonly regionModel: Model<Region>,
    @InjectModel(Area.name) private readonly areaModel: Model<Area>,
  ) {}

  private readonly areaRepository = new AreaRepository(this.areaModel);

  async create(dto: CreateAreaDto): Promise<any> {
    try {
      const region = await this.regionModel.findById(dto.regionId);

      const data = await this.areaModel.create({
        region: region.name,
        regionId: region._id,
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

  async update(id: string, dto: UpdateAreaDto): Promise<any> {
    try {
      const data = await this.areaRepository.updateEntity(id, dto);
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
      const data = await this.areaRepository.getEntityById(id);
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

  async getAll(getAreaDto: GetAreaDto): Promise<any> {
    const { regionId, areaId, page, limit } = getAreaDto;

    let filter: Record<string, unknown> = {};

    if (regionId) {
      filter = { ...filter, regionId };
    }

    if (areaId) {
      filter = { ...filter, _id: areaId };
    }

    try {
      const data = await this.areaModel
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
      const result = await this.areaRepository.deleteEntity(id);
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
