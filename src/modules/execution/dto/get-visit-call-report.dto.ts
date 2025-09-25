import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginateDto } from 'src/utils/dto/paginate.dto';
import { JobType } from '../interface/job.type';
import { UserType } from 'src/modules/user/interfaces/user.type';
import { StatusType } from '../interface/status.type';
import { ExecutionCallType } from '../interface/execution-call.type';

export class GetVisitCallReportDto extends PaginateDto {
  @ApiProperty({
    required: false,
    example: ['658d3c30112502673ca060d4'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  regionId: string[];

  @ApiProperty({
    required: false,
    example: ['658d4d40112502673ca2564a'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  areaId: string[];

  @ApiProperty({
    required: false,
    example: ['658d4f5e112502673ca293cf'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  territoryId: string[];

  @ApiProperty({
    required: false,
    example: ['64a461c13dbb5425eb03bc19'],
  })
  @IsMongoId({ each: true })
  @IsArray()
  @IsOptional()
  townId: string[];

  @ApiProperty({ example: 'town-code1' })
  @IsOptional()
  townCode: string;

  @ApiProperty({ example: '07-07-2023' })
  @IsOptional()
  fromDate: string;

  @ApiProperty({ example: '08-07-2023' })
  @IsOptional()
  toDate: string;

  @ApiProperty({
    example: [
      JobType.DISPLAY_AUDIT,
      JobType.QPDS,
      JobType.POSM_EXECUTION,
      JobType.FIXED_ASSET_TRACKING,
      JobType.SOS,
    ],
  })
  @IsArray()
  @IsOptional()
  task: string[];

  @ApiProperty({ example: [UserType.CM, UserType.MS] })
  @IsOptional()
  //@IsEnum(UserType)
  ffLevel: string[];

  @ApiProperty({ example: '64ceb85f0fe727470dc11f55' })
  @IsMongoId()
  @IsOptional()
  userId: string;

  @ApiProperty({ example: 'user-code1' })
  @IsOptional()
  userCode: string;

  @ApiProperty({ example: StatusType.PASSED })
  @IsOptional()
  @IsEnum(StatusType)
  aiStatus: string;

  @ApiProperty({ example: StatusType.PASSED })
  @IsOptional()
  @IsEnum(StatusType)
  msStatus: string;

  @ApiProperty({ example: 'no' })
  @IsOptional()
  @IsEnum(['yes', 'no'])
  isLocationMatched: string;

  @ApiProperty({ example: ExecutionCallType.YES })
  @IsOptional()
  @IsEnum(ExecutionCallType)
  executionDone: string;

  @ApiProperty({ example: 'UNG' })
  @IsOptional()
  channel: string;

  @ApiProperty({ example: ['BS', 'NS', 'DS', 'QPDS'] })
  @IsOptional()
  //@IsEnum(['BS', 'NS', 'DS', 'QPDS'])
  outletType: string;

  @ApiProperty({ example: 'outlet-1' })
  @IsOptional()
  outletCode: string;

  @ApiProperty({ example: 'Schedule Covered' })
  @IsOptional()
  @IsEnum(['Schedule Covered', 'Pending Covered'])
  callType: string;

  @ApiProperty({ example: 'yes' })
  @IsOptional()
  @IsEnum(['yes', 'no'])
  isAiReady: string;

  @ApiProperty({ example: 'Backlit' })
  @IsOptional()
  @IsString()
  fatAssetType: string;

  @ApiProperty({ example: 'METRO' })
  @IsOptional()
  @IsString()
  shelfTalkerType: string;

  @ApiProperty({ example: 'Sunsilk Onion Shelf In Shelf' })
  @IsOptional()
  @IsString()
  materialName: string;

  @ApiProperty({ example: 'ONIONSHELFINSHELFFEB24' })
  @IsOptional()
  @IsString()
  materialCode: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  displayChallengeStatus: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  shelfTalkerChallengeStatus: string;

  @ApiProperty({ example: 'Passed' })
  @IsOptional()
  @IsString()
  displayStatus: string;

  @ApiProperty({ example: 'Passed' })
  @IsOptional()
  @IsString()
  qpdsStatus: string;

  @ApiProperty({ example: 'Pending' })
  @IsOptional()
  @IsString()
  auditStatus: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  hotspot: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  exclusivity: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  planogramAdherence: string;

  @ApiProperty({ example: 'Shelf Talker issue' })
  @IsOptional()
  @IsString()
  displayRemarks: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  overallComplianceMet: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  variantComplianceMet: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  shelfTalkerExist: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  ublSOVMHigh: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  shelvingNormMaintained: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  ublSOSHigh: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  ublSachetPresenceHigh: string;

  @ApiProperty({ example: 'Brand' })
  @IsOptional()
  @IsString()
  hangerPresence: string;

  @ApiProperty({ example: 'GAL' })
  @IsOptional()
  @IsString()
  displayName: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  requestForChallenge: string;

  @ApiProperty({ example: 'Yes' })
  @IsOptional()
  @IsString()
  challengedBySupervisor: string;

  @ApiProperty({
    example: ['PONDS', 'GAL', 'Hair Care'],
    required: false,
    default: [],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  displayType: string[];
}
