import { Module } from '@nestjs/common';
import { RegionModule } from './region/region.module';
import { AreaModule } from './area/area.module';
import { TerritoryModule } from './territory/territory.module';
import { TownModule } from './town/town.module';
import { DataManagementService } from './data-management.service';
import { DataManagementController } from './data-management.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    RegionModule,
    AreaModule,
    TerritoryModule,
    TownModule,
    AuthModule,
  ],
  controllers: [DataManagementController],
  providers: [DataManagementService],
})
export class DataManagementModule {}
