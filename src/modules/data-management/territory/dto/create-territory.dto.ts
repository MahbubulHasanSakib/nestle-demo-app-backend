import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateTerritoryDto {
  @ApiProperty({ example: '658d3c30112502673ca060d4' })
  @IsString()
  @IsMongoId()
  regionId: string;

  @ApiProperty({ example: '658d4d40112502673ca2564a' })
  @IsString()
  @IsMongoId()
  areaId: string;

  @ApiProperty({ example: 'Jamalpur' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
