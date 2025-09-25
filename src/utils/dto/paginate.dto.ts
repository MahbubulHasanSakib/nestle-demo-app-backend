import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class PaginateDto {
  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 1 })
  page: number = 1;

  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 10 })
  limit: number = 10;
}
