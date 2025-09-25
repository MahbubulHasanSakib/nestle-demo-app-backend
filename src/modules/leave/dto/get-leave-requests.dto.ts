import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { UserType } from 'src/modules/user/interfaces/user.type';
import { FilterDto } from 'src/utils/dto/filter.dto';

export class GetLeaveRequestsDto extends FilterDto {
  @ApiProperty({ example: UserType.CM })
  @IsEnum(UserType)
  @IsOptional()
  userLevel: string;

  @ApiProperty({ example: '65a6e091b6587ec16913d784' })
  @IsMongoId()
  @IsOptional()
  userId: string;
}
