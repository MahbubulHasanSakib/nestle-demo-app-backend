import { Module } from '@nestjs/common';
import { TownController } from './town.controller';
import { TownService } from './town.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Town, TownSchema } from './schema/town.schema';
import { RouteModule } from 'src/modules/route/route.module';
import { TerritoryModule } from '../territory/territory.module';
@Module({
  imports: [
    RouteModule,
    TerritoryModule,
    MongooseModule.forFeature([{ name: Town.name, schema: TownSchema }]),
  ],
  controllers: [TownController],
  providers: [TownService],
  exports: [MongooseModule],
})
export class TownModule {}
