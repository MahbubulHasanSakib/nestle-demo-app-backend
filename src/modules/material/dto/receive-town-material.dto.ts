import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TownDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  regionId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  area: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  areaId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  territory: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  territoryId: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  towncode: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}

export class MaterialDto {
  @ApiProperty({ required: true })
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: true, example: 1 })
  @IsNotEmpty()
  @IsNumber()
  qty: number;
}

export class ReceiveTownMateialDto {
  @ApiProperty({
    type: TownDto,
    example: {
      id: '54a3b33ce1578407a43f8a9a',
      name: 'town-1',
      towncode: 'towncode-1',
      regionId: '74a3b33ce1578407a43f8a9a',
      region: 'region-1',
      areaId: '84a3b33ce1578407a43f8a9a',
      area: 'area-1',
      territoryId: '94a3b33ce1578407a43f8a9a',
      territory: 'territory-1',
    },
  })
  @ValidateNested()
  @Type(() => TownDto)
  town: TownDto;

  @ApiProperty({ type: [MaterialDto] })
  @ValidateNested({ each: true, message: 'Validation error' })
  @IsArray({ message: 'Must be array' })
  @Type(() => MaterialDto)
  material: MaterialDto[];
}
