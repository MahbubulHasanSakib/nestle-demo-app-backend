import { Module } from '@nestjs/common';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Region, RegionSchema } from './schema/region.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Region.name, schema: RegionSchema }]),
  ],
  controllers: [RegionController],
  providers: [RegionService],
  exports: [MongooseModule],
})
export class RegionModule {}
