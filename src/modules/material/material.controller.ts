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
  Res,
  Header,
  UploadedFile,
} from '@nestjs/common';
import { Constants } from 'src/utils/constants';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { ReturnLostDamageDto } from './dto/return-lost-damage.dto';
import type { Response } from 'express';
import { ExcludeCustomInterceptor } from 'src/utils/decorator/exclude-custom-interceptor.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from './dto/file-upload.dto';
import { TownMaterialAllocationDto } from './dto/town-material-allocation.dto';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionType } from '../auth/interface/permission.type';

@ApiTags('material')
@UseInterceptors(ResponseInterceptor)
@Controller({ path: 'material', version: Constants.API_VERSION_1 })
export class MaterialController {
  constructor(private readonly service: MaterialService) {}

  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateMaterialDto, @User() user: IUser) {
    return this.service.create(dto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/material-list')
  async materialsList() {
    return this.service.materialsList();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaterialDto,
    @User() user: IUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

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
