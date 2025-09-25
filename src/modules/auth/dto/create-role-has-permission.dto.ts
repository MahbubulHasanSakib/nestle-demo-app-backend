import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateRoleHasPermissionDto {
  @ApiProperty({
    example: [
      '64bb97456db2d2cac15c7c1e',
      '64bb971b6db2d2cac15c7c16',
      '64bb974b6db2d2cac15c7c20',
    ],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  permissions: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
