import { Model } from 'mongoose';
import { Territory } from './schema/territory.schema';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';

export class TerritoryRepository<TerritoryDocument extends Territory> {
    constructor(private readonly model: Model<TerritoryDocument>) {}

    async createEntity(data: CreateTerritoryDto): Promise<Territory> {
        try {
            const createdEntity = new this.model(data);
            return await createdEntity.save();
        } catch (error) {
            throw new Error(`Error creating entity: ${error.message}`);
        }
    }

    async updateEntity(id: string, data: UpdateTerritoryDto): Promise<Territory | null> {
        try {
            const updatedEntity = await this.model.findByIdAndUpdate(id, data, { new: true });
            return updatedEntity;
        } catch (error) {
            throw new Error(`Error updating entity: ${error.message}`);
        }
    }

    async getEntityById(id: string): Promise<Territory | null> {
        try {
            const entity = await this.model.findById(id);
            return entity;
        } catch (error) {
            throw new Error(`Error getting entity by ID: ${error.message}`);
        }
    }

    async getAllEntities(filterQuery: any, skip: number, limit: number): Promise<{ data: Territory[]; pageCount: number }> {
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
