import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AccountOpenRequest {
  @ApiProperty({ example: 'sakib.login', required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'sakib', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'sakib@gmail.com', required: true })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({ example: 'Chittagong', required: true })
  @IsString()
  @IsNotEmpty()
  territory: string;

  @ApiProperty({
    example: 'Request to provide me a portal user account',
  })
  @IsString()
  @IsOptional()
  note: string;
}
