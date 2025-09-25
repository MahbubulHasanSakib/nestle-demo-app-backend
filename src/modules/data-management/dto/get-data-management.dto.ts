import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

export class GetDataManagementDto {
  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsOptional()
  regionId: string[];

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsOptional()
  areaId: string[];

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsOptional()
  territoryId: string[];

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsOptional()
  townId: string[];
}
