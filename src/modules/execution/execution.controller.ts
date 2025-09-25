import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { ExecutionService } from './execution.service';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { AuthGuard } from '../auth/auth.guard';
import { FindSalesReportDto } from './dto/find-sales-report.dto';

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

  @Post('sales-report')
  findSalesReport(@Body() query: FindSalesReportDto) {
    return this.executionService.findSalesReport(query);
  }
}
