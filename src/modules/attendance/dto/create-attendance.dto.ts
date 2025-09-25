import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImageObj {
  @IsString()
  name: string;

  @IsString()
  original: string;

  @IsString()
  thumb: string;
}

export class CreateAttendaceDto {
  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  punchInAt: Date;

  @ApiPropertyOptional({ example: '30ccf3037025096f45cb87bf' })
  @IsMongoId()
  townId: string;

  @ApiPropertyOptional({ example: '40ccf3037025096f45cb87cf' })
  @IsMongoId()
  @IsOptional()
  outletId: string;

  @ApiProperty({
    example: {
      name: 'name',
      original: 'original',
      thumb: 'thumb',
    },
  })
  @IsNotEmpty()
  image: ImageObj;

  @ApiProperty({ example: 41.507483 })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @ApiProperty({ example: -99.436554 })
  @IsNumber()
  @IsNotEmpty()
  lon: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  withinRadius: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isFaceMatched: boolean;

  @ApiProperty({ example: 12.1124 })
  @IsNumber()
  @IsNotEmpty()
  distance: number;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  punchOutAt: Date;

  @ApiProperty({ example: '1.0.2' })
  @IsOptional()
  @IsString()
  appVersion: string;
}
