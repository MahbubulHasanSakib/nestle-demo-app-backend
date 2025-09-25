import { Module } from '@nestjs/common';
import { RouteController } from './route.controller';
import { RouteService } from './services/route.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RouteSchema } from './schema/route.schema';
import { OutletModule } from '../outlet/outlet.module';
import { UserModule } from '../user/user.module';
import { ExecutionModule } from '../execution/execution.module';
import {
  Execution,
  ExecutionSchema,
} from '../execution/schema/execution.schema';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    AuthModule,
    OutletModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: 'Route',
        schema: RouteSchema,
      },
      {
        name: Execution.name,
        schema: ExecutionSchema,
      },

    ]),
  ],
  controllers: [RouteController],
  providers: [RouteService],
  exports: [MongooseModule],
})
export class RouteModule {}
