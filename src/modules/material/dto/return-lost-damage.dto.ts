import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class Town {
  @IsNotEmpty()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  towncode: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsString()
  area: string;

  @IsNotEmpty()
  @IsString()
  territory: string;
}

class MaterialItem {
  @ApiProperty({ example: '64a50dd31d4b1a53294b10f6' })
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'material-1' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'company-1' })
  @IsString()
  company: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  returnQuantity: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  lostQuantity: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  damageQuantity: number;
}

export class ReturnLostDamageDto {
  @ApiProperty({ type: [MaterialItem] })
  @ValidateNested({ each: true, message: 'Validation error' })
  @IsArray({ message: 'Must be array' })
  @Type(() => MaterialItem)
  items: MaterialItem[];

  @ApiProperty({
    example: {
      id: '54a3b33ce1578407a43f8a9a',
      name: 'dh-1',
      region: 'region-1',
      area: 'area-1',
      territory: 'territory-1',
      towncode: 'town123',
    },
  })
  @IsNotEmpty()
  town: Town;

  @ApiProperty({
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  handOverAmount: number;
}
