import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { PaginateDto } from 'src/utils/dto/paginate.dto';

export class GetAreaDto extends PaginateDto {
  @ApiProperty({ example: '658d3c30112502673ca060d4', required: false })
  @IsMongoId()
  @IsOptional()
  regionId: string;

  @ApiProperty({ example: '658d4d40112502673ca2564a', required: false })
  @IsMongoId()
  @IsOptional()
  areaId: string;
}
