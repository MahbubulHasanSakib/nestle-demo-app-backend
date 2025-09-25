import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class SuspendUserDto {
  @ApiProperty({ example: '65a6e548b6587ec16913d957', required: true })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
