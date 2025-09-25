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
  Version,
} from '@nestjs/common';
import { Constants } from 'src/utils/constants';
import { OutletService } from './outlet.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { OutletFilterDto } from './dto/outlet-filter.dto';

@ApiTags('outlet')
@UseInterceptors(ResponseInterceptor)
@Controller({ path: 'outlet', version: Constants.API_VERSION_1 })
export class OutletController {
  constructor(private readonly service: OutletService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateOutletDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('outlet-list')
  outletList(@Query() outletFilterDto: OutletFilterDto, @User() user: IUser) {
    return this.service.outletList(outletFilterDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOutletDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  getAll(
    @Query() query: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.service.getAll(query, page, limit);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
