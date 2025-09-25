import { Model } from 'mongoose';
import { Town } from './schema/town.schema';
import { CreateTownDto } from './dto/create-town.dto';
import { UpdateTownDto } from './dto/update-town.dto';

export class TownRepository<TownDocument extends Town> {
    constructor(private readonly model: Model<TownDocument>) {}

    async createEntity(data: CreateTownDto): Promise<Town> {
        try {
            const createdEntity = new this.model(data);
            return await createdEntity.save();
        } catch (error) {
            throw new Error(`Error creating entity: ${error.message}`);
        }
    }

    async updateEntity(id: string, data: UpdateTownDto): Promise<Town | null> {
        try {
            const updatedEntity = await this.model.findByIdAndUpdate(id, data, { new: true });
            return updatedEntity;
        } catch (error) {
            throw new Error(`Error updating entity: ${error.message}`);
        }
    }

    async getEntityById(id: string): Promise<Town | null> {
        try {
            const entity = await this.model.findById(id);
            return entity;
        } catch (error) {
            throw new Error(`Error getting entity by ID: ${error.message}`);
        }
    }

    async getAllEntities(filterQuery: any, skip: number, limit: number): Promise<{ data: Town[]; pageCount: number }> {
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
