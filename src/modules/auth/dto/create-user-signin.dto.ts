import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { UserType } from 'src/modules/user/interfaces/user.type';
import { LoggedOnType } from 'src/modules/user/interfaces/loggedOn.type';

export class DeviceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateUserSignInDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: LoggedOnType })
  @IsNotEmpty()
  @IsEnum(LoggedOnType)
  loggedOn: LoggedOnType;

  @ApiProperty({ example: 'CM,CC,WMA,DFF,MTCM' })
  @IsOptional()
  @IsEnum(['CM,CC,WMA,DFF,MTCM', 'MS'])
  userType: string;

  @ApiProperty({ example: 12.1124 })
  @IsOptional()
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 20.1124 })
  @IsOptional()
  @IsNumber()
  lon: number;

  @ApiProperty({ type: DeviceDto })
  @ValidateIf((o) => o.loggedOn === LoggedOnType.APP)
  @Type(() => DeviceDto)
  @ValidateNested()
  @IsDefined()
  device: DeviceDto;

  @ApiProperty({ example: '1.0.2' })
  @IsOptional()
  @IsString()
  appVersion: string;
}
