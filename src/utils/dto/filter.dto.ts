import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsMongoId, IsOptional } from 'class-validator';
import { PaginateDto } from './paginate.dto';

export class FilterDto extends PaginateDto {
  @ApiPropertyOptional({
    required: false,
    example: ['658d3c30112502673ca060d4'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  regionId: string[];

  @ApiPropertyOptional({
    required: false,
    example: ['658d4d40112502673ca2564a'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  areaId: string[];

  @ApiPropertyOptional({
    required: false,
    example: ['658d4f5e112502673ca293cf'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  territoryId: string[];

  @ApiPropertyOptional({
    required: false,
    example: ['6499646448d10fcb8d37fd4e'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  townId: string[];

  @ApiPropertyOptional({ example: new Date() })
  @IsOptional()
  @IsDate()
  from: Date;

  @ApiPropertyOptional({ example: new Date() })
  @IsOptional()
  @IsDate()
  to: Date;
}
