import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthActivityService } from './auth-activity.service';
import { CreateAuthActivityDto } from './dto/create-auth-activity.dto';
import { UpdateAuthActivityDto } from './dto/update-auth-activity.dto';
import { GetAuthActivities } from './dto/get-auth-activity.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionType } from '../auth/interface/permission.type';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('auth-activity')
export class AuthActivityController {
  constructor(private readonly authActivityService: AuthActivityService) {}

  @Post()
  create(@Body() createAuthActivityDto: CreateAuthActivityDto) {
    return this.authActivityService.create(createAuthActivityDto);
  }

  @ApiBearerAuth()
  /*@Permissions(PermissionType.LOGIN_DETAILS)*/
  @UseGuards(AuthGuard /* PermissionsGuard*/)
  @Post('log-report')
  findAll(@Body() body: GetAuthActivities) {
    return this.authActivityService.findAll(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authActivityService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAuthActivityDto: UpdateAuthActivityDto,
  ) {
    return this.authActivityService.update(+id, updateAuthActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authActivityService.remove(+id);
  }
}
