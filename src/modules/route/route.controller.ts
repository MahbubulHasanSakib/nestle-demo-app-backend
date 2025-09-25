import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RouteService } from './services/route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { AuthGuard } from '../auth/auth.guard';
import { GetRouteTrackerDto } from './dto/get-route-tracker.dto';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionType } from '../auth/interface/permission.type';
import { PermissionsGuard } from '../auth/permissions.guard';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';

@ApiTags('routes')
@UseInterceptors(ResponseInterceptor)
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('')
  createRoute(@Body() CreateRouteDto: CreateRouteDto) {
    return this.routeService.createRoute(CreateRouteDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('')
  findAllRoutes() {
    return this.routeService.findAllRoutes();
  }


  @Get(':routecode/outlets')
  outletsOfRoute(@Param('routecode') routecode: string) {
    return this.routeService.outletsOfRoute(routecode);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  findOneRoute(@Param('id') id: string) {
    return this.routeService.findOneRoute(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  updateRoute(@Param('id') id: string, @Body() UpdateRouteDto: UpdateRouteDto) {
    return this.routeService.updateRoute(id, UpdateRouteDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  removeRoute(@Param('id') id: string) {
    return this.routeService.removeRoute(id);
  }
}
