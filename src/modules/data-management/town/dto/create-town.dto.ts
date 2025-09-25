import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTownDto {
  @ApiProperty({ example: '658d3c30112502673ca060d4' })
  @IsMongoId()
  regionId: string;

  @ApiProperty({ example: '658d4d40112502673ca2564a' })
  @IsMongoId()
  areaId: string;

  @ApiProperty({ example: '658d4f5e112502673ca293cf' })
  @IsMongoId()
  territoryId: string;

  @ApiProperty({ example: 'Sarishabari' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'D64' })
  @IsString()
  @IsNotEmpty()
  towncode: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  lon: number;
}
