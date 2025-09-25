import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { Constants } from 'src/utils/constants';
import { TownService } from './town.service';
import { CreateTownDto } from './dto/create-town.dto';
import { UpdateTownDto } from './dto/update-town.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { GetTownDto } from './dto/get-town.dto';
import { AuthGuard } from 'src/modules/auth/auth.guard';
@UseInterceptors(ResponseInterceptor)
@Controller({ path: 'town', version: Constants.API_VERSION_1 })
export class TownController {
  constructor(private readonly service: TownService) {}

  @Post()
  create(@Body() dto: CreateTownDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/town-list')
  townList() {
    return this.service.townListWithLabelValue();
  }

  @Get(':towncode/routes')
  routesOfTown(@Param('towncode') towncode: string) {
    return this.service.routesOfTown(towncode);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTownDto) {
    return this.service.update(id, dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('all')
  getAll(@Body() getTownDto: GetTownDto) {
    return this.service.getAll(getTownDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
