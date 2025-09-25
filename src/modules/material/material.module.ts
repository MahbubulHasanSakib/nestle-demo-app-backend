import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialSchema } from './schema/material.schema';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/schemas/user.schema';
import { TownModule } from '../data-management/town/town.module';
import { AuthModule } from '../auth/auth.module';
import { AttendanceModule } from '../attendance/attendance.module';
@Module({
  imports: [
    AuthModule,
    TownModule,
    UserModule,
    AttendanceModule,
    MongooseModule.forFeature([
      { name: 'Material', schema: MaterialSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MongooseModule],
})
export class MaterialModule {}
