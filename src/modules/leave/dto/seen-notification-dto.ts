import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { LeaveKind } from '../interface/leave-kind.type';

export class SeenNotificationDto {
  @ApiProperty({ example: '656ae4e7b50313b4f64acc80' })
  @IsMongoId()
  @IsNotEmpty()
  leaveId: string;

  @ApiProperty({ example: 2023 })
  @IsNumber()
  @IsNotEmpty()
  year: number;

  @ApiProperty({ example: LeaveKind.SICK })
  @IsString()
  @IsNotEmpty()
  @IsEnum([LeaveKind.ANNUAL, LeaveKind.SICK])
  kind: string;
}
