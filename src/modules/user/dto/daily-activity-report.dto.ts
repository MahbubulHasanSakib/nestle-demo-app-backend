import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginateDto } from 'src/utils/dto/paginate.dto';

export class DailyActivityReportDto extends PaginateDto {
  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsOptional()
  regionId: string[];

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsOptional()
  areaId: string[];

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsOptional()
  territoryId: string[];

  @ApiProperty({ required: false })
  @IsMongoId({ each: true })
  @IsOptional()
  townId: string[];

  @ApiProperty({ required: false })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @IsOptional()
  day: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  userType: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  punchIn: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  inHand: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  punchOut: string;
}
