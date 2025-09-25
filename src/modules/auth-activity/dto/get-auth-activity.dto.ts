import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsDate,
  IsEnum,
  IsString,
  IsMongoId,
} from 'class-validator';
import { PaginateDto } from 'src/utils/dto/paginate.dto';

export class GetAuthActivities extends PaginateDto {
  @ApiPropertyOptional({ example: '64cf1741bb9607c151b486f4' })
  @IsOptional()
  @IsMongoId()
  userId: string;

  @ApiPropertyOptional({ example: new Date() })
  @IsOptional()
  @IsDate()
  from: Date;

  @ApiPropertyOptional({ example: new Date() })
  @IsOptional()
  @IsDate()
  to: Date;

  @ApiPropertyOptional({ example: 'Rasel' })
  @IsOptional()
  @IsString()
  name: string;
}
