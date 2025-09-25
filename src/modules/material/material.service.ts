import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Material } from './schema/material.schema';
import { MaterialRepository } from './material.repository';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Constants } from 'src/utils/constants';
import { ResponseUtils } from 'src/utils/response.utils';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/schemas/user.schema';
import { startAndEndOfDate } from 'src/utils/utils';
import {
  ReturnLostDamage,
  ReturnLostDamageDto,
} from './dto/return-lost-damage.dto';
import { ImageObj } from 'src/utils/dto/image.dto';
import { Town } from '../data-management/town/schema/town.schema';
import * as Excel from '@zlooun/exceljs';
import type { Response } from 'express';
import { UserType } from '../user/interfaces/user.type';
import { TownMaterialAllocationDto } from './dto/town-material-allocation.dto';
import { AttendanceService } from '../attendance/attendance.service';
import * as dayjs from 'dayjs';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel('Town') private readonly townModel: Model<Town>,
    @InjectModel('Material') private readonly MaterialModel: Model<Material>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private attendanceService: AttendanceService,
  ) {}

  private readonly materialRepository = new MaterialRepository(
    this.MaterialModel,
  );

  async create(dto: CreateMaterialDto, user: IUser): Promise<any> {
    try {
      let data;
      data = await this.materialRepository.createEntity(dto, user);

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

  async update(id: string, dto: UpdateMaterialDto, user: IUser): Promise<any> {
    try {
      const data = await this.materialRepository.updateEntity(id, dto, user);
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
      const data = await this.materialRepository.getEntityById(id);
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

  async getAll(query: any, page: number = 1, limit: number = 10): Promise<any> {
    const { category, company, channel, materialName, materialCode } = query;

    const filterQuery: Record<string, any> = {};

    if (category) {
      filterQuery.category = category;
    }

    if (company) {
      filterQuery.company = company;
    }

    if (channel) {
      filterQuery.channel = channel;
    }
    if (materialName) {
      filterQuery.name = materialName;
    }
    if (materialCode) {
      filterQuery.materialCode = materialCode;
    }

    const skip = (page - 1) * limit;

    try {
      const data = await this.materialRepository.getAllEntities(
        filterQuery,
        skip,
        limit,
      );
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
      const result = await this.materialRepository.deleteEntity(id);
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

  async materialsList() {
    const materials = await this.MaterialModel.aggregate([
      {
        $project: {
          _id: 0,
          label: '$name',
          value: '$_id',
        },
      },
    ]);
    return { data: materials, message: 'Material List found successfully' };
  }
}
