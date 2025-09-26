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
import { TownMaterial } from './schema/town-material.schema';
import { ReceiveTownMateialDto } from './dto/receive-town-material.dto';
import { MaterialAssignment } from './schema/material-assignment.schema';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel('Town') private readonly townModel: Model<Town>,
    @InjectModel('Material') private readonly MaterialModel: Model<Material>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(TownMaterial.name)
    private readonly townMaterialModel: Model<TownMaterial>,
    @InjectModel(MaterialAssignment.name)
    private readonly materialAssignmentModel: Model<MaterialAssignment>,
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

  async getTownMaterialsByUser(user: IUser) {
    const townMaterial = await this.townMaterialModel.find({
      'town.id': { $in: user.town },
    });
    return {
      data: townMaterial,
    };
  }

  async ReceiveTownMaterial(dto: ReceiveTownMateialDto, user: IUser) {
    const { town, material } = dto;
    const userId = user._id;
    const townId = town.id;

    if (material.length === 0) {
      return { message: 'No materials provided for receiving.' };
    }

    const session = await this.townMaterialModel.db.startSession();
    session.startTransaction();

    try {
      // Step 1: Deduct material from the town's stock
      const townStock = await this.townMaterialModel
        .findOne({ 'town.id': new Types.ObjectId(town.id) }, null, { session })
        .select('_id')
        .lean();

      if (!townStock) {
        throw new NotFoundException(
          `Stock document not found for town ID: ${town.id}`,
        );
      }

      const bulkOperationsTown = material.map((materialItem) => {
        return {
          updateOne: {
            filter: {
              _id: townStock._id,
              'material.id': new Types.ObjectId(materialItem.id),
            },
            update: {
              $inc: { 'material.$.remaining': -materialItem.qty },
            },
          },
        };
      });

      const townResult = await this.townMaterialModel.bulkWrite(
        bulkOperationsTown,
        { session },
      );

      // Step 2: Update or create the user's material document
      const userMaterialDocument =
        await this.materialAssignmentModel.findOneAndUpdate(
          {
            'user.id': new Types.ObjectId(userId),
            'town.id': new Types.ObjectId(townId),
          },
          {
            $setOnInsert: {
              user: {
                id: user._id,
                name: user.name,
                usercode: user.usercode,
                type: user.kind,
              },
              town: {
                id: new Types.ObjectId(town.id),
                name: town.name,
                towncode: town.towncode,
                territory: town.territory,
                territoryId: new Types.ObjectId(town.territoryId),
                area: town.area,
                areaId: new Types.ObjectId(town.areaId),
                region: town.region,
                regionId: new Types.ObjectId(town.regionId),
              },
              material: [],
            },
          },
          { upsert: true, new: true, lean: true, session },
        );

      const bulkOperationsUser = material.map((materialItem) => {
        const existingMaterial = userMaterialDocument.material.find(
          (m) => m.id.toString() === materialItem.id.toString(),
        );

        if (existingMaterial) {
          return {
            updateOne: {
              filter: {
                _id: userMaterialDocument._id,
                'material.id': new Types.ObjectId(materialItem.id),
              },
              update: {
                $inc: { 'material.$.remaining': materialItem.qty },
              },
            },
          };
        } else {
          return {
            updateOne: {
              filter: { _id: userMaterialDocument._id },
              update: {
                $push: {
                  material: {
                    id: new Types.ObjectId(materialItem.id),
                    name: materialItem.name,
                    company: materialItem.company,
                    category: materialItem.category,
                    remaining: materialItem.qty,
                    pending: 0,
                  },
                },
              },
            },
          };
        }
      }) as any;

      const userResult = await this.materialAssignmentModel.bulkWrite(
        bulkOperationsUser,
        { session },
      );

      // If all operations were successful, commit the transaction
      await session.commitTransaction();

      return {
        message: 'Material received and updated in user stock.',
        data: {
          townModifiedCount: townResult.modifiedCount,
          userModifiedCount:
            userResult.modifiedCount +
            userResult.upsertedCount +
            userResult.matchedCount,
        },
      };
    } catch (error) {
      // If any operation fails, abort the transaction
      await session.abortTransaction();
      throw new BadRequestException(
        'Transaction failed due to an error.',
        error.message,
      );
    } finally {
      // End the session
      await session.endSession();
    }
  }
}
