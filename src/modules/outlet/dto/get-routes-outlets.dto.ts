import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetRoutesOutlets {
  @ApiProperty({ example: '835', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  routecode: string;

  @ApiProperty({ example: 'outlet-1', required: false })
  @IsString()
  @IsOptional()
  outletcode: string;
}
