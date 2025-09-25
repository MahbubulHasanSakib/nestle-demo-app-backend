import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JobTypes } from '../interfaces/job.type';

export class TownDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class RouteDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  routecode: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UserDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  usercode: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  kind: string;
}

export class SlabDto {
  @ApiProperty({ required: true })
  @IsArray()
  @IsString({ each: true })
  name: string[];

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  kind: string;
}

export class JobDto {
  @ApiProperty({ type: String, enum: JobTypes, required: true })
  @IsEnum(JobTypes)
  name: string;

  @ApiProperty({ required: true, type: [SlabDto] })
  @IsArray()
  @IsString({ each: true })
  slab: SlabDto[];
}

export class CreateOutletDto {
  @ApiProperty({
    type: TownDto,
    example: {
      id: '65758fb0700a23dcd9456397',
      name: 'Sample Town',
    },
  })
  @ValidateNested()
  @Type(() => TownDto)
  town: TownDto;

  @ApiProperty({
    type: RouteDto,
    example: {
      id: '65758fb0700a23dcd9456397',
      routecode: 'R1',
      name: 'Sample Route',
    },
  })
  @ValidateNested()
  @Type(() => RouteDto)
  route: RouteDto;

  @ApiProperty({ required: true, example: 'Outlet Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true, example: 'OUT-001' })
  @IsString()
  @IsNotEmpty()
  outletcode: string;

  @ApiProperty({ required: true, example: '0123405056' })
  @IsString()
  @IsNotEmpty()
  contactNo: string;

  @ApiProperty({ required: true, example: 'Retail' })
  @IsString()
  @IsNotEmpty()
  channel: string;

  @ApiProperty({ required: true, type: Number, example: 40.7128 })
  @IsLatitude()
  lat: number;

  @ApiProperty({ required: true, type: Number, example: -74.006 })
  @IsLongitude()
  lon: number;

  @ApiProperty({
    type: [JobDto],
    example: [
      {
        name: 'FAT',
        slab: [
          { name: 'Slab1', kind: 'someKind' },
          { name: 'Slab2', kind: 'someKind' },
        ],
      },
    ],
  })
  @ValidateNested()
  @IsArray({ message: 'Must be array' })
  @Type(() => JobDto)
  job: JobDto[];

  @ApiProperty({
    type: UserDto,
    example: {
      id: '65758fb0700a23dcd9456397',
      name: 'John Doe',
      usercode: 'user34',
      kind: 'Sales',
    },
  })
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;
}
