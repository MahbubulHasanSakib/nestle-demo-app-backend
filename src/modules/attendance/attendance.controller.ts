import {
  Body,
  Controller,
  Req,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendaceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceQueryDto, MSTeamAttendanceQueryDto } from './dto/query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { GetAttendanceTrackerDto } from './dto/attendance-tracker.dto';
import { PermissionType } from '../auth/interface/permission.type';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@ApiTags('attendance')
@UseInterceptors(ResponseInterceptor)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // @ApiBearerAuth()
  // /*@Permissions(PermissionType.ATTENDANCE)*/
  // @UseGuards(AuthGuard /*PermissionsGuard*/)
  @Post('/attendanceTracker')
  attendanceTracker(
    @Body() query: GetAttendanceTrackerDto,
    @User() user: IUser,
  ) {
    return this.attendanceService.attendanceTracker(
      query /*{
      msId: user.msId,
      townsId: user.townsId,
      projectAccess: user.projectAccess,
    }*/,
    );
  }

  @Version('2')
  // @ApiBearerAuth()
  // @Permissions(PermissionType.ATTENDANCE)
  // @UseGuards(AuthGuard ,PermissionsGuard)
  @Post('/attendanceTracker')
  attendanceTrackerV2(
    @Body() query: GetAttendanceTrackerDto,
    @User() user: IUser,
  ) {
    return this.attendanceService.attendanceTrackerV2(
      query /*{
      msId: user.msId,
      townsId: user.townsId,
      projectAccess: user.projectAccess,
    }*/,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('')
  createAttendance(
    @Body() CreateAttendaceDto: CreateAttendaceDto,
    @User() user: IUser,
  ) {
    return this.attendanceService.createAttendance(CreateAttendaceDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('my-attendances')
  findAttendancesOfSignedInUser(
    @User() user: IUser,
    @Query() query: AttendanceQueryDto,
  ) {
    return this.attendanceService.findAttendancesOfSignedInUser(user, query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('supervisor/employee-attendances')
  findAttendancesAsSupervisor(
    @User() user: IUser,
    @Query() query: AttendanceQueryDto,
  ) {
    return this.attendanceService.findAttendancesAsSupervisor(user, query);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Version('2')
  @Get('supervisor/employee-attendances')
  findAttendancesAsSupervisorV2(
    @User() user: IUser,
    @Query() query: MSTeamAttendanceQueryDto,
  ) {
    return this.attendanceService.findAttendancesAsSupervisorV2(user, query);
  }

  @Get(':id')
  findOneAttendance(@Param('id') id: string) {
    return this.attendanceService.findOneAttendance(id);
  }

  @Patch(':id')
  updateAttendance(
    @Param('id') id: string,
    @Body() UpdateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.updateAttendance(id, UpdateAttendanceDto);
  }

  @Delete(':id')
  removeAttendance(@Param('id') id: string) {
    return this.attendanceService.removeAttendance(id);
  }
}
