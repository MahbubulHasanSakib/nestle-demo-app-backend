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
import { ReturnLostDamageDto } from './dto/return-lost-damage.dto';
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
import { Attendance } from '../attendance/schema/attendance.schema';
import { Execution } from '../execution/schema/execution.schema';

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
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>,
    @InjectModel(Execution.name)
    private readonly executionModel: Model<Execution>,
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
    const townMaterials = await this.townMaterialModel
      .find({
        'town.id': { $in: user.town },
      })
      .lean();

    const materialsData = await this.MaterialModel.find({})
      .select('_id price image batch size category')
      .lean();

    const materialMap = new Map(
      materialsData.map((mat) => [
        mat._id.toString(),
        {
          price: mat.price,
          image: mat.image,
          batch: mat.batch,
          size: mat.size,
        },
      ]),
    );

    const result = townMaterials.map((twn) => {
      const materialsWithPrices = twn.material.map((mat) => {
        const uniqueItem = materialMap.get(mat.id.toString());
        return {
          ...mat,
          unitPrice: uniqueItem !== undefined ? uniqueItem.price : null,
          image: uniqueItem !== undefined ? uniqueItem.image : null,
          batch: uniqueItem !== undefined ? uniqueItem.batch : null,
          size: uniqueItem !== undefined ? uniqueItem.size : null,
        };
      });
      return {
        ...twn,
        material: materialsWithPrices,
      };
    });

    return {
      data: result,
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
        .select('_id material')
        .lean();

      if (!townStock) {
        throw new NotFoundException(
          `Stock document not found for town ID: ${town.id}`,
        );
      }

      for (const materialItem of material) {
        console.log(townStock);
        const stockMaterial = townStock.material.find(
          (m) => m.id.toString() === materialItem.id.toString(),
        );
        if (!stockMaterial || stockMaterial.remaining < materialItem.qty) {
          throw new BadRequestException(
            `Insufficient stock for material: ${materialItem.name}.`,
          );
        }
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
      console.log(error);
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

  async returnMaterialsInTowns(dto: ReturnLostDamageDto, user: IUser) {
    const { startOfToday, endOfToday } = startAndEndOfDate();
    let attendance = await this.attendanceModel.findOne({
      'user.id': user._id,
      punchInAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

    if (!attendance)
      throw new BadRequestException('Please submit your attendance first');

    const session = await this.materialAssignmentModel.db.startSession();
    session.startTransaction();

    try {
      const { items, town, handOverAmount } = dto;

      const userMaterialDocument = await this.materialAssignmentModel
        .findOne({
          'user.id': user._id,
          'town.id': new Types.ObjectId(town.id),
        })
        .session(session)
        .lean();

      if (!userMaterialDocument) {
        throw new NotFoundException(
          'User has no material assigned to this town.',
        );
      }

      // First, validate all material quantities before performing any updates
      for (const item of items) {
        const material = userMaterialDocument.material.find(
          (m) => m.id.toString() === item.id.toString(),
        );

        if (!material) {
          throw new BadRequestException(
            `Material with id ${item.id} is not assigned to the user.`,
          );
        }

        const totalToDeduct =
          (item.returnQuantity || 0) +
          (item.damageQuantity || 0) +
          (item.lostQuantity || 0);
        if (totalToDeduct > material.remaining) {
          throw new BadRequestException(
            `Cannot return more of material ${item.name} than you have.`,
          );
        }
      }

      const bulkOperationsUser = items
        .map((item) => {
          const totalToDeduct =
            (item.returnQuantity || 0) +
            (item.damageQuantity || 0) +
            (item.lostQuantity || 0);

          if (totalToDeduct > 0) {
            return {
              updateOne: {
                filter: {
                  _id: userMaterialDocument._id,
                  'material.id': new Types.ObjectId(item.id),
                },
                update: {
                  $inc: { 'material.$.remaining': -totalToDeduct },
                },
              },
            };
          }
        })
        .filter(Boolean) as any; // Filter out null/undefined and cast to any

      // Deduct materials from the user's stock
      if (bulkOperationsUser.length > 0) {
        await this.materialAssignmentModel.bulkWrite(bulkOperationsUser, {
          session,
        });
      }

      const bulkOperationsTown = items
        .filter((item) => (item.returnQuantity || 0) > 0)
        .map((item) => ({
          updateOne: {
            filter: {
              'town.id': new Types.ObjectId(town.id),
              'material.id': new Types.ObjectId(item.id),
            },
            update: {
              $inc: { 'material.$.remaining': item.returnQuantity },
            },
          },
        })) as any;

      // Return materials to the town's stock
      if (bulkOperationsTown.length > 0) {
        await this.townMaterialModel.bulkWrite(bulkOperationsTown, { session });
      }

      if (handOverAmount >= 0) {
        attendance.handOverAmount = handOverAmount;
        await attendance.save({ session });
      }

      await session.commitTransaction();

      return {
        message: 'Materials returned to town successfully.',
      };
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(
        'Transaction failed to complete.',
        error.message,
      );
    } finally {
      session.endSession();
    }
  }

  async userStock(user: IUser) {
    let { startOfToday, endOfToday } = startAndEndOfDate();
    let lastHandOverDate = await this.attendanceModel
      .findOne({
        'user.id': user._id,
        handOverAmount: { $exists: true },
      })
      .sort({ punchInAt: -1 })
      .select('punchInAt');

    let filterDate = {};
    if (lastHandOverDate) {
      let { startOfToday, endOfToday: dayEnd } = startAndEndOfDate(
        lastHandOverDate.punchInAt,
      );
      filterDate = {
        executionEndAt: {
          $gt: dayEnd,
          $lte: endOfToday,
        },
      };
    } else {
      filterDate = {
        executionEndAt: {
          $lte: endOfToday,
        },
      };
    }

    let saleData = await this.executionModel.aggregate([
      {
        $match: {
          'town.id': { $in: user.town },
          'user.id': user._id,
          ...filterDate,
        },
      },
      {
        $facet: {
          totalOrderedAmount: [
            {
              $group: {
                _id: null,
                total: { $sum: '$totalOrderedAmount' },
              },
            },
          ],
          exchangeItems: [
            {
              $unwind: '$exchangeItems',
            },
            {
              $group: {
                _id: {
                  townId: '$town.id',
                  itemId: '$exchangeItems.id',
                  itemName: '$exchangeItems.name',
                },
                total: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                townId: '$_id.townId',
                itemId: '$_id.itemId',
                itemName: '$_id.itemName',
                total: 1,
              },
            },
          ],
          returnItems: [
            {
              $unwind: '$returnItems',
            },
            {
              $group: {
                _id: {
                  itemId: '$returnItems.id',
                  itemName: '$returnItems.name',
                },
                total: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                itemName: '$_id.itemName',
                quantity: '$total',
              },
            },
          ],
        },
      },
    ]);
    const [aggregatedResults] = saleData;
    let totalOrderedAmount = 0;
    let exchangeItems = [];
    let returnItems = [];

    if (aggregatedResults) {
      totalOrderedAmount =
        aggregatedResults?.totalOrderedAmount?.[0]?.total || 0;
      exchangeItems = aggregatedResults?.exchangeItems || [];
      returnItems = aggregatedResults?.returnItems || [];
    }

    let stock = await this.materialAssignmentModel
      .find({
        'user.id': user._id,
        deletedAt: null,
      })
      .lean();

    const materialsData = await this.MaterialModel.find({})
      .select('_id price image batch size category')
      .lean();

    const materialMap = new Map(
      materialsData.map((mat) => [
        mat._id.toString(),
        {
          price: mat.price,
          image: mat.image,
          batch: mat.batch,
          size: mat.size,
        },
      ]),
    );

    const result = stock.map((stk) => {
      const materialsWithImages = stk.material.map((mat) => {
        const uniqueItem = materialMap.get(mat.id.toString());
        const exchangeItem = exchangeItems?.find(
          (e) =>
            e.townId.toString() === stk.town.id.toString() &&
            e.itemId.toString() === mat.id.toString(),
        );
        return {
          ...mat,
          unitPrice: uniqueItem !== undefined ? uniqueItem.price : null,
          image: uniqueItem !== undefined ? uniqueItem.image : null,
          batch: uniqueItem !== undefined ? uniqueItem.batch : null,
          size: uniqueItem !== undefined ? uniqueItem.size : null,
          exchangeQty: exchangeItem ? exchangeItem.total : 0,
        };
      });
      return {
        ...stk,
        material: materialsWithImages,
      };
    });

    return {
      data: {
        stock: result,
        returnItems,
        handOverAmount: totalOrderedAmount,
      },
    };
  }
}
