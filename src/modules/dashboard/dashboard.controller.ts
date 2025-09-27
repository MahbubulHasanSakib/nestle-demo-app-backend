import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionType } from '../auth/interface/permission.type';
import { PermissionsGuard } from '../auth/permissions.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { DashboardFilter } from './dto/dashboard-filter.dto';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiBearerAuth()
  /*@Permissions(PermissionType.DASHBOARD)*/
  @UseGuards(AuthGuard /*PermissionsGuard*/)
  @Post('')
  dashboardDetails(@Body() query: DashboardFilter, @User() user: IUser) {
    return this.dashboardService.dashboard(query, {
      msId: user.msId,
      townsId: user.townsId,
      projectAccess: user.projectAccess,
    });
  }
}
