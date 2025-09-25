import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class AttendanceQueryDto {
  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  date: Date;
}

export class MSTeamAttendanceQueryDto {
  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  startAt: Date;

  @ApiProperty({ example: new Date() })
  @IsNotEmpty()
  endAt: Date;

  @ApiProperty({ required: false, example: '66f2598b0a271ef750fe9f4c' })
  @IsMongoId()
  @IsOptional()
  cmId: string;
}
