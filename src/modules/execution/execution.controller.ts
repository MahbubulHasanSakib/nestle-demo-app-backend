import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import {
  CreateExecutionDto,
} from './dto/create-execution.dto';
import { ExecutionService } from './execution.service';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { AuthGuard } from '../auth/auth.guard';
import { GetVisitCallReportDto } from './dto/get-visit-call-report.dto';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionType } from '../auth/interface/permission.type';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('execution')
@UseInterceptors(ResponseInterceptor)
@Controller('execution')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createExecutionDto: CreateExecutionDto, @User() user: IUser) {
    return this.executionService.create(createExecutionDto, user);
  }

}
