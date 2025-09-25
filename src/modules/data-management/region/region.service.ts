import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Region } from './schema/region.schema';
import { RegionRepository } from './region.repository';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Constants } from 'src/utils/constants';
import { ResponseUtils } from 'src/utils/response.utils';
import { GetRegionDto } from './dto/get-region.dto';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel('Region') private readonly regionModel: Model<Region>,
  ) {}

  private readonly regionRepository = new RegionRepository(this.regionModel);

  async create(dto: CreateRegionDto): Promise<any> {
    try {
      const data = await this.regionRepository.createEntity(dto);
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

  async update(id: string, dto: UpdateRegionDto): Promise<any> {
    try {
      const data = await this.regionRepository.updateEntity(id, dto);
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
      const data = await this.regionRepository.getEntityById(id);
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

  async getAll(getRegionDto: GetRegionDto): Promise<any> {
    const { regionId, page, limit } = getRegionDto;

    let filter: Record<string, unknown> = {};

    if (regionId) {
      filter = { ...filter, _id: regionId };
    }

    try {
      const data = await this.regionModel
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
      const result = await this.regionRepository.deleteEntity(id);
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
