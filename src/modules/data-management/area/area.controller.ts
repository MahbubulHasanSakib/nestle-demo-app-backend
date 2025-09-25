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
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { GetAreaDto } from './dto/get-area.dto';

@Controller({ path: 'area', version: Constants.API_VERSION_1 })
export class AreaController {
  constructor(private readonly service: AreaService) {}

  @Post()
  create(@Body() dto: CreateAreaDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    return this.service.update(id, dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('all')
  getAll(@Body() getAreaDto: GetAreaDto) {
    return this.service.getAll(getAreaDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
