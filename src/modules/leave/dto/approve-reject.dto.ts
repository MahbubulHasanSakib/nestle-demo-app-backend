import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsMongoId,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { LeaveStatusType } from '../interface/leave-status.type';
import { LeaveKind } from '../interface/leave-kind.type';
import { LeaveModifiedFrom } from '../interface/leave-modified-from.type';

export class LeaveApprovalTypeDto {
  @ApiProperty({ example: '64a502132461ba33a82a1682' })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '656ae4e7b50313b4f64acc80' })
  @IsMongoId()
  @IsNotEmpty()
  leaveId: string;

  @ApiProperty({ example: 2023 })
  @IsNumber()
  @IsOptional()
  year: number;

  @ApiProperty({ example: LeaveKind.SICK })
  @IsString()
  @IsOptional()
  @IsEnum([LeaveKind.ANNUAL, LeaveKind.SICK])
  reason: string;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @IsOptional()
  startAt: Date;

  @ApiProperty({ example: new Date() })
  @IsDate()
  @IsOptional()
  endAt: Date;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  day: number;

  @ApiProperty({ required: true, example: LeaveStatusType.APPROVE })
  @IsString()
  @IsNotEmpty()
  @IsEnum([LeaveStatusType.APPROVE, LeaveStatusType.DECLINE])
  status: string;

  @ApiProperty({ required: true, example: LeaveModifiedFrom.APP })
  @IsString()
  @IsOptional()
  @IsEnum([LeaveModifiedFrom.PORTAL, LeaveModifiedFrom.APP])
  modifiedOn: string;
}
