import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { UserType } from '../interfaces/user.type';
import { PaginateDto } from 'src/utils/dto/paginate.dto';

export class SearchEmployee extends PaginateDto {
  @ApiPropertyOptional({ example: ['6499639f48d10fcb8d37fd46'] })
  @IsMongoId({ each: true })
  @IsOptional()
  regionId: string[];

  @ApiPropertyOptional({ example: ['649963d548d10fcb8d37fd48'] })
  @IsMongoId({ each: true })
  @IsOptional()
  areaId: string[];

  @ApiPropertyOptional({ example: ['64b27b2bb6de7532849ed98b'] })
  @IsMongoId({ each: true })
  @IsOptional()
  territoryId: string[];

  @ApiPropertyOptional({ example: ['6499646448d10fcb8d37fd4e'] })
  @IsMongoId({ each: true })
  @IsOptional()
  townId: string[];

  @ApiPropertyOptional({ example: ['64995ebfbfe2fc4d90eed846'] })
  @IsMongoId({ each: true })
  @IsOptional()
  supervisorId: string[];

  @ApiProperty({
    required: false,
    example: UserType.CM,
    enum: UserType,
    type: [String],
  })
  @IsOptional()
  @ValidateIf((obj) => typeof obj.type === 'string')
  @IsEnum(UserType)
  @ValidateIf((obj) => Array.isArray(obj.type))
  @IsArray()
  @IsEnum(UserType, { each: true })
  type: string | string[];

  @ApiProperty({
    required: false,
    example: 'Mark',
  })
  @IsOptional()
  @IsString()
  employeeName: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  employeeUsername: string;

  @ApiProperty({
    required: false,
    example: 'code1',
  })
  @IsOptional()
  @IsString()
  employeeCode: string;

  @ApiProperty({
    required: false,
    example: 'yes',
  })
  @IsOptional()
  @IsString()
  idLock: string;

  @ApiProperty({
    required: false,
    example: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'locked'])
  status: string;

  @ApiProperty({
    required: false,
    example: '977711851',
  })
  @IsOptional()
  @IsString()
  nidNo: string;

  @ApiProperty({
    required: false,
    example: 'sakib@gmail.com',
  })
  @IsOptional()
  @IsString()
  employeeEmail: string;

  @ApiProperty({
    required: false,
    example: 'Resignation',
  })
  @IsOptional()
  @IsEnum(['Resignation', 'Terminated', 'Warning'])
  actionType: string;
}
