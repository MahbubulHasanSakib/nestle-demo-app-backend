import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Material, MaterialSchema } from './schema/material.schema';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/schemas/user.schema';
import { TownModule } from '../data-management/town/town.module';
import { AuthModule } from '../auth/auth.module';
import { AttendanceModule } from '../attendance/attendance.module';
import {
  TownMaterial,
  TownMaterialSchema,
} from './schema/town-material.schema';
import {
  MaterialAssignment,
  MaterialAssignmentSchema,
} from './schema/material-assignment.schema';
@Module({
  imports: [
    AuthModule,
    TownModule,
    UserModule,
    AttendanceModule,
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
      { name: User.name, schema: UserSchema },
      { name: TownMaterial.name, schema: TownMaterialSchema },
      { name: MaterialAssignment.name, schema: MaterialAssignmentSchema },
    ]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MongooseModule],
})
export class MaterialModule {}
