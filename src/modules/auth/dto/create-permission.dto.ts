import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  submodule: string;
}
