import { Model } from 'mongoose';
import { Material } from './schema/material.schema';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { IUser } from '../user/interfaces/user.interface';
import { MaterialKind } from './interfaces/material-kind.type';

export class MaterialRepository<MaterialDocument extends Material> {
  constructor(private readonly model: Model<MaterialDocument>) {}

  async createEntity(data: CreateMaterialDto, user: IUser): Promise<Material> {
    try {
      const createdEntity = new this.model(data);
      return await createdEntity.save();
    } catch (error) {
      throw new Error(`Error creating entity: ${error.message}`);
    }
  }

  async updateEntity(
    id: string,
    data: UpdateMaterialDto,
    user: IUser,
  ): Promise<Material | null> {
    try {
      const updatedEntity = await this.model.findByIdAndUpdate(
        id,
        {
          ...data,
          modifier: user._id,
        },
        { new: true },
      );
      return updatedEntity;
    } catch (error) {
      throw new Error(`Error updating entity: ${error.message}`);
    }
  }

  async getEntityById(id: string): Promise<Material | null> {
    try {
      const entity = await this.model.findById(id);
      return entity;
    } catch (error) {
      throw new Error(`Error getting entity by ID: ${error.message}`);
    }
  }

  async getAllEntities(
    filterQuery: any,
    skip: number,
    limit: number,
  ): Promise<{ data: Material[]; pageCount: number }> {
    try {
      const [entities, total] = await Promise.all([
        this.model.find(filterQuery).skip(skip).limit(limit).exec(),
        this.model.countDocuments(filterQuery).exec(),
      ]);

      const pageCount = Math.ceil(total / limit);

      return { data: entities, pageCount };
    } catch (error) {
      throw new Error(`Error getting all entities: ${error.message}`);
    }
  }

  async deleteEntity(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Error deleting entity: ${error.message}`);
    }
  }
}
