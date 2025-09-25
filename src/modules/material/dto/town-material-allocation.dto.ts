import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional } from 'class-validator';

export class TownMaterialAllocationDto {
  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  regionId: string[];

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  areaId: string[];

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  territoryId: string[];

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  townId: string[];

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  materialId: string[];
}
