import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendaceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(CreateAttendaceDto) {}
