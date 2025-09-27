import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { LeaveApprovalTypeDto } from './dto/approve-reject.dto';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { SeenNotificationDto } from './dto/seen-notification-dto';
import { GetLeaveRequestsDto } from './dto/get-leave-requests.dto';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionType } from '../auth/interface/permission.type';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('leave')
@UseInterceptors(ResponseInterceptor)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('')
  createLeave(@Body() CreateLeaveDto: CreateLeaveDto, @User() user: IUser) {
    return this.leaveService.createLeaveRequest(CreateLeaveDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Version('2')
  @Post('')
  createLeaveV2(@Body() createLeaveDto: CreateLeaveDto, @User() user: IUser) {
    return this.leaveService.createLeaveRequestV2(createLeaveDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('')
  async findAllSubordinatesLeaveOfMS(@User() user: IUser) {
    return await this.leaveService.findAllSubordinatesLeaveOfMS(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/leave-summary')
  async leaveSummary(@User() user: IUser) {
    return await this.leaveService.leaveSummary(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/team-leave-summary')
  async teamLeaveSummary(@User() user: IUser) {
    return await this.leaveService.teamLeaveSummary(user);
  }

  @ApiBearerAuth()
  /*(PermissionType.LEAVE_APPROVAL)*/
  @UseGuards(AuthGuard /*PermissionsGuard*/)
  @Post('leave-requests')
  async getAllLeaveRequestAsAdmin(@Body() query: GetLeaveRequestsDto) {
    return await this.leaveService.getAllLeaveRequestAsAdmin(query);
  }

  @ApiBearerAuth()
  @Version('2')
  /*@Permissions(PermissionType.LEAVE_APPROVAL)*/
  @UseGuards(AuthGuard /* PermissionsGuard*/)
  @Post('leave-requests')
  async getAllLeaveRequestAsAdminV2(
    @Body() query: GetLeaveRequestsDto,
    @User() user: IUser,
  ) {
    return await this.leaveService.getAllLeaveRequestAsAdminV2(query, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/ms/employee-requests')
  async getAllLeaveRequestAsMs(@User() user: IUser) {
    return await this.leaveService.getAllLeaveRequestAsMs(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('/approve-reject')
  async approveOrRejectLeaveRequest(
    @User() user: IUser,
    @Body() LeaveApprovalTypeDto: LeaveApprovalTypeDto,
  ) {
    return await this.leaveService.approveOrRejectLeaveRequest(
      user,
      LeaveApprovalTypeDto,
    );
  }

  @Get('notification/user')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAllLeaveNotificationsByUser(@User() user: IUser) {
    return this.leaveService.findAllLeaveNotificationsByUser(user);
  }

  @Patch('seen')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  updateLeaveNotificationSeen(
    @User() user: IUser,
    @Body() SeenNotificationDto: SeenNotificationDto,
  ) {
    return this.leaveService.updateLeaveNotificationSeen(
      user,
      SeenNotificationDto,
    );
  }
}
