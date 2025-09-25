import { Module } from '@nestjs/common';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Area, AreaSchema } from './schema/area.schema';
import { RegionModule } from '../region/region.module';

@Module({
  imports: [
    RegionModule,
    MongooseModule.forFeature([{ name: Area.name, schema: AreaSchema }]),
  ],
  controllers: [AreaController],
  providers: [AreaService],
  exports: [MongooseModule],
})
export class AreaModule {}
