import { PartialType } from '@nestjs/swagger';
import { CreateAuthActivityDto } from './create-auth-activity.dto';

export class UpdateAuthActivityDto extends PartialType(CreateAuthActivityDto) {}
