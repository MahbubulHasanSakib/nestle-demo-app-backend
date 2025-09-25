import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { Constants } from 'src/utils/constants';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { SummaryService } from './summary.service';
import {
  GetTownSummaryQuery,
  GetUserSummaryQuery,
} from './interfaces/queries.type';
import { AuthGuard } from '../auth/auth.guard';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionType } from '../auth/interface/permission.type';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('summary')
@UseInterceptors(ResponseInterceptor)
@Controller({ path: 'summary', version: Constants.API_VERSION_1 })
export class SummaryController {
  constructor(private readonly service: SummaryService) {}
}
