import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgetPasswordDto {
  @ApiProperty({ example: 'mahbubul@hedigital.tech', required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
