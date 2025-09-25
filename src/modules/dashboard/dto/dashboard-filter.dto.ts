import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserType } from 'src/modules/user/interfaces/user.type';
import { FilterDto } from 'src/utils/dto/filter.dto';

export class DashboardFilter extends FilterDto {
  @ApiProperty({ example: UserType.CM })
  @IsEnum(UserType)
  @IsOptional()
  employeeLevel: string;
}
