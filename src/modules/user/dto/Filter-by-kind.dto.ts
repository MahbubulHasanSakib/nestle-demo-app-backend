import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, ValidateIf } from 'class-validator';
import { UserType } from '../interfaces/user.type';

export class FilterUserByKindDto {
  @ApiProperty({
    required: false,
    // example: UserType.CM,
    enum: UserType,
    type: [String],
  })
  @IsOptional()
  @ValidateIf((obj) => typeof obj.type === 'string')
  @IsEnum(UserType)
  @ValidateIf((obj) => Array.isArray(obj.type))
  @IsArray()
  @IsEnum(UserType, { each: true })
  kind: string | string[];
}
