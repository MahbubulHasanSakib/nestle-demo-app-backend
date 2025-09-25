import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { LeaveKind } from '../interface/leave-kind.type';

export class CreateLeaveDto {
  @ApiProperty({
    example: new Date(),
  })
  @IsDate()
  @IsNotEmpty()
  startAt: Date;

  @ApiProperty({
    example: new Date(),
  })
  @IsDate()
  @IsNotEmpty()
  endAt: Date;

  @ApiProperty({
    example: 2023,
  })
  @IsNumber()
  @IsNotEmpty()
  year: number;

  /*@ApiProperty({
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  day: number;*/

  @ApiProperty({ required: true, example: LeaveKind.ANNUAL })
  @IsString()
  @IsNotEmpty()
  @IsEnum([LeaveKind.ANNUAL, LeaveKind.SICK])
  reason: string;

  @ApiProperty({
    type: String,
    example: 'You can write a comment here(optional)',
  })
  @IsString()
  @IsOptional()
  comment: string;
}
