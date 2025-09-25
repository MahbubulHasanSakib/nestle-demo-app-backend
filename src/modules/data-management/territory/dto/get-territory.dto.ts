import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { PaginateDto } from 'src/utils/dto/paginate.dto';

export class GetTerritoryDto extends PaginateDto {
  @ApiProperty({ example: '658d3c30112502673ca060d4', required: false })
  @IsMongoId()
  @IsOptional()
  regionId: string;

  @ApiProperty({ example: '658d4d40112502673ca2564a', required: false })
  @IsMongoId()
  @IsOptional()
  areaId: string;

  @ApiProperty({ example: '658d4f5e112502673ca293cf', required: false })
  @IsMongoId()
  @IsOptional()
  territoryId: string;
}
