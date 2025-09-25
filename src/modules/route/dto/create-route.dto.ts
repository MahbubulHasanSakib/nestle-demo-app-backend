import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  ValidateNested,
  IsArray,
  IsEnum,
} from 'class-validator';
import { JobType } from 'src/modules/execution/interface/job.type';

export class JobDto {
  @IsNotEmpty()
  @IsEnum(JobType)
  name: string;

  @IsNotEmpty()
  @IsNumber()
  count: number;
}

export class CreateRouteDto {
  @ApiProperty({ example: '1A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'route-1' })
  @IsString()
  @IsNotEmpty()
  routecode: string;

  @ApiProperty({ example: 'town-1' })
  @IsString()
  @IsNotEmpty()
  towncode: string;

  @ApiProperty({ example: 35 })
  @IsNumber()
  @IsNotEmpty()
  outletCount: number;

  @ApiProperty({
    example: [
      {
        name: 'DA',
        count: 12,
      },
      {
        name: 'SOS',
        count: 23,
      },
    ],
  })
  @ValidateNested()
  @IsArray({ message: 'Must be array' })
  @Type(() => JobDto)
  job: JobDto[];
}
