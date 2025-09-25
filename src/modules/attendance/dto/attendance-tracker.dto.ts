import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmployeeType } from '../interface/employee.type';
import { UserType } from 'src/modules/user/interfaces/user.type';

export class GetAttendanceTrackerDto {
  @ApiProperty({
    required: false,
    example: ['658d3c30112502673ca060d4'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  regionId: string[];

  @ApiProperty({
    required: false,
    example: ['658d4d40112502673ca2564a'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  areaId: string[];

  @ApiProperty({
    required: false,
    example: ['658d4f5e112502673ca293cf'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  territoryId: string[];

  @ApiProperty({
    required: false,
    example: ['64a461c13dbb5425eb03bc19'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  townId: string[];

  @ApiProperty({ required: false, example: '07-07-2023' })
  @IsOptional()
  date: string;

  @ApiProperty({ required: false, example: [UserType.CM, UserType.MS] })
  //@IsEnum(EmployeeType)
  @IsOptional()
  employeeLevel: string[];

  @ApiProperty({
    required: false,
    example: 'CM1206',
  })
  @IsOptional()
  @IsString()
  employeeCode: string;

  @ApiProperty({ example: '65a6e091b6587ec16913d784' })
  @IsMongoId()
  @IsOptional()
  employeeId: string;

  @ApiProperty({
    required: false,
    example: 'D20',
  })
  @IsOptional()
  @IsString()
  townCode: string;

  @ApiProperty({ required: false, example: 'no' })
  @IsEnum(['yes', 'no'])
  @IsOptional()
  isLocationMatched: string;

  @ApiProperty({ required: false, example: 'no' })
  @IsEnum(['yes', 'no'])
  @IsOptional()
  lateAttendance: string;

  @ApiProperty({ required: false, example: 'no' })
  @IsEnum(['yes', 'no'])
  @IsOptional()
  facialError: string;
}
