import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class OutletFilterDto {
  @ApiProperty({ required: false, example: '66f25a4e0a271ef750fe9f4f' })
  @IsMongoId()
  @IsOptional()
  townId: string;

  @ApiProperty({ required: false, example: 'Route name' })
  @IsString()
  @IsOptional()
  route: string;

  @ApiProperty({ required: false, example: 'K72R69' })
  @IsString()
  @IsOptional()
  outletcode: string;
}
