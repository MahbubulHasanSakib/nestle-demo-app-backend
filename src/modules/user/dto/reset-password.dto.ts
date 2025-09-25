import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class ResetPasswordDto {
  @ApiProperty({ example: '65a6e548b6587ec16913d957', required: true })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
