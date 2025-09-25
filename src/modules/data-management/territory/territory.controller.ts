import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { Constants } from 'src/utils/constants';
import { TerritoryService } from './territory.service';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';
import { GetTerritoryDto } from './dto/get-territory.dto';

@Controller({ path: 'territory', version: Constants.API_VERSION_1 })
export class TerritoryController {
  constructor(private readonly service: TerritoryService) {}

  @Post()
  create(@Body() dto: CreateTerritoryDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTerritoryDto) {
    return this.service.update(id, dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('all')
  getAll(@Body() getTerritoryDto: GetTerritoryDto) {
    return this.service.getAll(getTerritoryDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
