import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';
import { FilterDto } from 'src/utils/dto/filter.dto';

export class FindSalesReportDto extends FilterDto {
  @ApiPropertyOptional({
    required: false,
    example: ['658d4d40112502673ca2564a'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  userId: string[];

  @ApiPropertyOptional({
    required: false,
    example: 'Pending',
  })
  @IsString()
  @IsOptional()
  orderStatus: string;

  @ApiPropertyOptional({
    required: false,
    example: 'Pending',
  })
  @IsString()
  @IsOptional()
  deliveryStatus: string;

  @ApiPropertyOptional({
    required: false,
    example: 'Bhai bhai store',
    description: 'Search by outlet name, outlet code or order id',
  })
  @IsString()
  @IsOptional()
  searchTerm: string;
}
