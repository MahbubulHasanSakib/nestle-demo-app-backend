import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({ example: '658d3c30112502673ca060d4' })
  @IsMongoId()
  regionId: string;

  @ApiProperty({ example: 'TANGAIL' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
