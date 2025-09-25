import { Model } from 'mongoose';
import { Outlet } from './schema/outlet.schema';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';

export class OutletRepository<OutletDocument extends Outlet> {
    constructor(private readonly model: Model<OutletDocument>) {}

    async createEntity(data: CreateOutletDto): Promise<Outlet> {
        try {
            const createdEntity = new this.model(data);
            return await createdEntity.save();
        } catch (error) {
            throw new Error(`Error creating entity: ${error.message}`);
        }
    }
    
    async updateEntity(id: string, data: UpdateOutletDto): Promise<Outlet | null> {
        try {
            const updatedEntity = await this.model.findByIdAndUpdate(
                id,
                data,
                { new: true }
            );
            return updatedEntity;
        } catch (error) {
            throw new Error(`Error updating entity: ${error.message}`);
        }
    }
    
    async getEntityById(id: string): Promise<Outlet | null> {
        try {
            const entity = await this.model.findById(id);
            return entity;
        } catch (error) {
            throw new Error(`Error getting entity by ID: ${error.message}`);
        }
    }

    async getAllEntities(filterQuery: any, skip: number, limit: number): Promise<{ data: Outlet[]; pageCount: number }> {
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
