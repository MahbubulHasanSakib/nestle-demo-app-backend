import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { DataManagementService } from './data-management.service';
import { GetDataManagementDto } from './dto/get-data-management.dto';
import { PermissionType } from '../auth/interface/permission.type';
import { Permissions } from '../auth/permissions.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

@ApiTags('data-management')
@UseInterceptors(ResponseInterceptor)
@Controller('data-management')
export class DataManagementController {
  constructor(private readonly dataManagementService: DataManagementService) {}

  @Post('all')
  @ApiBearerAuth()
  @Permissions(PermissionType.DATA_MANAGEMENT)
  @UseGuards(AuthGuard, PermissionsGuard)
  @HttpCode(HttpStatus.OK)
  findAll(
    @Body() getDataManagementDto: GetDataManagementDto,
    @User() user: IUser,
  ) {
    return this.dataManagementService.findAll(getDataManagementDto, user);
  }
}
