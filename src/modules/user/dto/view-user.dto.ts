import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginateDto } from 'src/utils/dto/paginate.dto';

export class ViewUserDto extends PaginateDto {
  @ApiProperty({
    required: false,
    example: 'Admin Level',
  })
  @IsOptional()
  @IsString()
  usertype: string;

  @ApiProperty({
    required: false,
    example: 'Super Admin',
    type: String,
  })
  @IsOptional()
  group: string;

  @ApiProperty({
    required: false,
    example: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'locked'])
  status: string;

  @ApiProperty({
    required: false,
    example: 'joni.admin',
  })
  @IsOptional()
  @IsString()
  username: string;

  @ApiProperty({
    required: false,
    example: 'Md Razikul Islam Joni',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  index: number;

  @ApiProperty({
    required: false,
    example: 'sakib@gmail.com',
  })
  @IsOptional()
  @IsString()
  email: string;
}
