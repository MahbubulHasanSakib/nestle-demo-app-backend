import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialKind } from '../interfaces/material-kind.type';

export class ImageObj {
  @IsString()
  @ApiProperty()
  name: string;

  @IsUrl()
  @ApiProperty()
  original: string;

  @IsUrl()
  @ApiProperty()
  thumb: string;
}

export class CreateMaterialDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  owner: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  category: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  materialCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  size?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  price?: number;

  @Type(() => ImageObj)
  @ValidateNested()
  @IsOptional()
  @ApiPropertyOptional({
    type: ImageObj,
    example: {
      name: '',
      thumb: '',
      original: '',
    },
  })
  image: ImageObj;
}
