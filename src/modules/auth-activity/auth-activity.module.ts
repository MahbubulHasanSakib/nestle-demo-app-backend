import { Module } from '@nestjs/common';
import { AuthActivityService } from './auth-activity.service';
import { AuthActivityController } from './auth-activity.controller';
import {
  AuthActivity,
  AuthActivitySchema,
} from './schemas/auth-activity.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: AuthActivity.name, schema: AuthActivitySchema },
    ]),
  ],
  controllers: [AuthActivityController],
  providers: [AuthActivityService],
})
export class AuthActivityModule {}
