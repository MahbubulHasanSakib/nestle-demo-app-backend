import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Patch,
  Delete,
  Version,
} from '@nestjs/common';
import { AiReportService } from './ai-report.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

@Controller('ai-report')
export class AiReportController {
  constructor(private readonly aiReportService: AiReportService) {}
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/ai-result')
  aiResultByTodayExecutions(@User() user:IUser) {
    return this.aiReportService.aiExecutionResult(user);
  }


  @Version("2")
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/ai-result')
  aiResultByTodayExecutionsV2(@User() user:IUser) {
    return this.aiReportService.aiExecutionResultV2(user);
  }
}
