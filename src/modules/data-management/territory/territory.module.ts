import { Module } from '@nestjs/common';
import { TerritoryController } from './territory.controller';
import { TerritoryService } from './territory.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Territory, TerritorySchema } from './schema/territory.schema';
import { AreaModule } from '../area/area.module';

@Module({
  imports: [
    AreaModule,
    MongooseModule.forFeature([
      { name: Territory.name, schema: TerritorySchema },
    ]),
  ],
  controllers: [TerritoryController],
  providers: [TerritoryService],
  exports: [MongooseModule],
})
export class TerritoryModule {}
