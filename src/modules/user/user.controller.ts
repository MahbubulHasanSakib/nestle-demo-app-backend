import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  ParseEnumPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './service/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './user.decorator';
import { IUser } from './interfaces/user.interface';
import { SearchEmployee } from './dto/search-employee.dto';
import { DailyActivityReportDto } from './dto/daily-activity-report.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionType } from '../auth/interface/permission.type';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { SMSSendDto } from './dto/sms-send.dto';
import { AccountOpenRequest } from './dto/account-open-request.dto';
import { ActiveStatus } from './interfaces/activity.type';
import { ViewUserDto } from './dto/view-user.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { FilterUserByKindDto } from './dto/Filter-by-kind.dto';
import { UserType } from './interfaces/user.type';

@ApiTags('user')
@UseInterceptors(ResponseInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('whoami')
  async whoami(@User() user: IUser) {
    return await this.userService.getWhoAmI(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('towns')
  async getTownsOfSupervisor(@User() user: IUser) {
    return this.userService.getTowns(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/cm-list')
  async cmListForSupervisor(@User() user: IUser) {
    return this.userService.cmListForSupervisor(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/user-towns-with-label-nd-value')
  async getUserTownsWithLabelAndValue(
    @Query('userId') userId: string,
    @Query('userType') userType: string,
  ) {
    return this.userService.getUserTownsWithLabelAndValue(userId, userType);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/users-list')
  async usersList(@Query() dto: FilterUserByKindDto) {
    return this.userService.usersList(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // @Post('resend-otp/:phone')
  // resendOtp(@Param('phone') phone: string) {
  //   return this.userService.sendOTP(phone);
  // }
}
