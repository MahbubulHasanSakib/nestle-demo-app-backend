import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { UserType } from '../interfaces/user.type';
import { Type } from 'class-transformer';

export class ImageDto {
  @IsUrl()
  @ApiProperty()
  original: string;

  @IsUrl()
  @ApiProperty()
  thumb: string;
}
export class NidPictureDto {
  @ApiProperty()
  @IsUrl()
  original: string;

  @ApiProperty()
  @IsUrl()
  thumb: string;
}

export class MerchandisingExperienceDto {
  @ApiProperty()
  @IsNumber()
  years: number;

  @ApiProperty()
  @IsNumber()
  months: number;
}

export class SalesExperienceDto {
  @ApiProperty()
  @IsNumber()
  years: number;

  @ApiProperty()
  @IsNumber()
  months: number;
}

export class ResignationDto {
  @ApiProperty()
  @IsString()
  resignReason: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  resignDate: Date;

  @ApiProperty()
  @IsUrl()
  resignLetterUrl: string;
}

export class TerminationDto {
  @ApiProperty()
  @IsString()
  terminationReason: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  terminationDate: Date;

  @ApiProperty()
  @IsUrl()
  terminationLetterUrl: string;
}

export class WarningDto {
  @ApiProperty()
  @IsString()
  warningReason: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  warningDate: Date;

  @ApiProperty()
  @IsUrl()
  warningLetterUrl: string;
}

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.kind !== UserType.ADMIN)
  @IsString()
  @IsNotEmpty()
  usercode: string;

  @ApiProperty({ enum: UserType })
  @IsEnum(UserType)
  kind: UserType;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.kind === UserType.ADMIN)
  @IsMongoId()
  landingPage: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.kind === UserType.ADMIN)
  @IsMongoId()
  roleId: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.kind === UserType.ADMIN)
  @IsMongoId({ each: true })
  @IsArray()
  regionId: string[];

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.kind === UserType.ADMIN)
  @IsMongoId({ each: true })
  @IsArray()
  areaId: string[];

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.kind === UserType.ADMIN)
  @IsMongoId({ each: true })
  @IsArray()
  territoryId: string[];

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.kind === UserType.ADMIN)
  @IsMongoId({ each: true })
  @IsArray()
  townId: string[];

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.kind === UserType.ADMIN)
  @IsMongoId({ each: true })
  @IsArray()
  msId: string[];

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.kind !== UserType.ADMIN)
  @IsMongoId({ each: true })
  @IsArray()
  town: string[];

  @ApiProperty({ required: false })
  @IsPhoneNumber('BD')
  @IsOptional()
  phone: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.kind === UserType.CM)
  @IsMongoId()
  supervisor: string;

  @ApiProperty({ type: ImageDto, required: false })
  @Type(() => ImageDto)
  @ValidateNested()
  @IsOptional()
  image: ImageDto;

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  modifier: string;

  @ApiProperty({ required: false, example: false })
  @IsBoolean()
  @IsOptional()
  requireNewPassword: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  gender: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nidNumber: string;

  @ApiProperty({ required: false, type: NidPictureDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NidPictureDto)
  nidPicture: NidPictureDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyPhone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  joiningDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  basicSalary: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  variablePay: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  travelAllowance: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  previousCompany: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  hiringReason: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  additionalNotes: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalSalary: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  accountNo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  routingNo: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branchName: string;

  @ApiProperty({ required: false, type: MerchandisingExperienceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MerchandisingExperienceDto)
  merchandisingExperience: MerchandisingExperienceDto;

  @ApiProperty({ required: false, type: SalesExperienceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SalesExperienceDto)
  salesExperience: SalesExperienceDto;

  @ApiProperty({ required: false, type: ResignationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResignationDto)
  resignation: ResignationDto;

  @ApiProperty({ required: false, type: TerminationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TerminationDto)
  termination: TerminationDto;

  @ApiProperty({ required: false, type: WarningDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WarningDto)
  warning: WarningDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  deletedAt: Date;
}
