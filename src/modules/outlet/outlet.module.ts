import { Module } from '@nestjs/common';
import { OutletController } from './outlet.controller';
import { OutletService } from './outlet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OutletSchema } from './schema/outlet.schema';
import { Route, RouteSchema } from '../route/schema/route.schema';
import { Town, TownSchema } from '../data-management/town/schema/town.schema';
import { UserSchema, User } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Outlet', schema: OutletSchema },
      { name: Route.name, schema: RouteSchema },
      { name: Town.name, schema: TownSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [OutletController],
  providers: [OutletService],
  exports: [MongooseModule],
})
export class OutletModule {}
