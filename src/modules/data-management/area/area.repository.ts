import { Model } from 'mongoose';
import { Area } from './schema/area.schema';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

export class AreaRepository<AreaDocument extends Area> {
    constructor(private readonly model: Model<AreaDocument>) {}

    async createEntity(data: CreateAreaDto): Promise<Area> {
        try {
            const createdEntity = new this.model(data);
            return await createdEntity.save();
        } catch (error) {
            throw new Error(`Error creating entity: ${error.message}`);
        }
    }

    async updateEntity(id: string, data: UpdateAreaDto): Promise<Area | null> {
        try {
            const updatedEntity = await this.model.findByIdAndUpdate(id, data, { new: true });
            return updatedEntity;
        } catch (error) {
            throw new Error(`Error updating entity: ${error.message}`);
        }
    }

    async getEntityById(id: string): Promise<Area | null> {
        try {
            const entity = await this.model.findById(id);
            return entity;
        } catch (error) {
            throw new Error(`Error getting entity by ID: ${error.message}`);
        }
    }

    async getAllEntities(filterQuery: any, skip: number, limit: number): Promise<{ data: Area[]; pageCount: number }> {
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
