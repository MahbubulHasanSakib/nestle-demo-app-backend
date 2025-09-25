import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreateRoleHasPermissionDto } from './dto/create-role-has-permission.dto';
import { UpdateRoleHasPermissionDto } from './dto/update-role-has-permission.dto';
import { CreateUserSignInDto } from './dto/create-user-signin.dto';
import { CreateUserSignUpDto } from './dto/create-user-signup.dot';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { AuthGuard } from './auth.guard';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { PaginateDto } from 'src/utils/dto/paginate.dto';
import { IpAddress } from 'src/utils/decorator/ip-address.decorator';
@ApiTags('auth')
@UseInterceptors(ResponseInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Below are all permission related endpoints.

  @Post('permission')
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.authService.createPermission(createPermissionDto);
  }

  @Get('permission')
  findAllPermission() {
    return this.authService.findAllPermission();
  }

  @Get('permission/list')
  findPermissionList() {
    return this.authService.findAllPermission();
  }

  @Get('permission/:id')
  findOnePermission(@Param('id') id: string) {
    return this.authService.findOnePermission(id);
  }

  @Patch('permission/:id')
  updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.authService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permission/:id')
  removePermission(@Param('id') id: string) {
    return this.authService.removePermission(id);
  }

  // Below are all role related endpoints.

  @Post('role-has-permission')
  createRoleHasPermission(
    @Body() createRoleHasPermissionDto: CreateRoleHasPermissionDto,
  ) {
    return this.authService.createRoleHasPermission(createRoleHasPermissionDto);
  }

  @ApiQuery({ name: 'page', type: Number })
  @ApiQuery({ name: 'limit', type: Number })
  @Get('role-has-permission')
  findAllRoleHasPermission(@Query() paginateDto: PaginateDto) {
    return this.authService.findAllRoleHasPermission(paginateDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('role-has-permission-user')
  findRoleHasPermissionByUserId(@User() user: IUser) {
    return this.authService.findRoleHasPermissionByUserId(
      user?._id?.toString(),
    );
  }

  @Get('role-has-permission/list')
  findAllRoleHasPermissionList() {
    return this.authService.findAllRoleHasPermissionList();
  }

  @Get('role-has-permission/:id')
  findOneRoleHasPermission(@Param('id') id: string) {
    return this.authService.findOneRoleHasPermission(id);
  }

  @Patch('role-has-permission/:id')
  updateRoleHasPermission(
    @Param('id') id: string,
    @Body() updateRoleHasPermissionDto: UpdateRoleHasPermissionDto,
  ) {
    return this.authService.updateRoleHasPermission(
      id,
      updateRoleHasPermissionDto,
    );
  }

  @Delete('role-has-permission/:id')
  removeRoleHasPermission(@Param('id') id: string) {
    return this.authService.removeRoleHasPermission(id);
  }

  // Below are the endpoints related to user sign in, sign up and sign out.

  @Post('signup')
  userSignUp(@Body() createUserSignUpDto: CreateUserSignUpDto) {
    return this.authService.userSignUp(createUserSignUpDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  userSignIn(
    @Body() createUserSignInDto: CreateUserSignInDto,
    @Req() request: Request,
  ) {
    return this.authService.userSignIn(createUserSignInDto, request);
  }

  @ApiBearerAuth()
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  userSignOut(@User() user: IUser, @Req() request: Request) {
    return this.authService.userSignOut(user, request);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('unregister-user-device/:userId')
  async unRegisterUserDevice(
    @Param('userId') userId: string,
    @User() user: IUser,
  ) {
    return await this.authService.unRegisterUserDevice(userId, user);
  }

  @Get('user-role')
  findAllUserRole() {
    return this.authService.findAll();
  }

  @Get('user-role/:id')
  findOneUserRole(@Param('id') id: string) {
    return this.authService.findOne(id);
  }
}
