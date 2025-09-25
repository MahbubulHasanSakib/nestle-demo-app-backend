import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRegionDto {
  @ApiProperty({ example: 'CENTRAL NORTH' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
