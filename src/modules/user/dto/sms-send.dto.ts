import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class SMSSendDto {
  @ApiProperty({ example: 'CM', required: true })
  @IsString()
  @IsNotEmpty()
  userType: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  page: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsOptional()
  limit: number;

  @ApiProperty({
    example: ['65baa57c45e890cf739fa9d7', '65baa57c45e890cf739fa9d8'],
  })
  @IsArray()
  @IsOptional()
  userIds: string[];
}
