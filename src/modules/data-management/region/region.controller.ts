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
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { GetRegionDto } from './dto/get-region.dto';

@Controller({ path: 'region', version: Constants.API_VERSION_1 })
export class RegionController {
  constructor(private readonly service: RegionService) {}

  @Post()
  create(@Body() dto: CreateRegionDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRegionDto) {
    return this.service.update(id, dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('all')
  getAll(@Body() getRegionDto: GetRegionDto) {
    return this.service.getAll(getRegionDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
