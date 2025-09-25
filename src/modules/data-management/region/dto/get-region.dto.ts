import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { PaginateDto } from 'src/utils/dto/paginate.dto';

export class GetRegionDto extends PaginateDto {
  @ApiProperty({ example: '658d3c30112502673ca060d4', required: false })
  @IsMongoId()
  @IsOptional()
  regionId: string;
}
