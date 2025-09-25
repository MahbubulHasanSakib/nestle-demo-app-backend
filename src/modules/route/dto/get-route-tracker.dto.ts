import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetRouteTrackerDto {
  @ApiProperty({ required: true, example: '64a547f0bb116fc21cd5aab0' })
  @IsMongoId()
  @IsOptional()
  userId: string;

  @ApiProperty({ required: true, example: 'CM1131' })
  @IsString()
  @IsOptional()
  userCode: string;

  @ApiProperty({ required: true, example: '07-07-2023' })
  @IsNotEmpty()
  date: string;

  @ApiProperty({ required: false, example: 'PJP' })
  @IsOptional()
  @IsEnum(['PJP', 'NON PJP', 'BOTH'])
  outletType: string;
}
