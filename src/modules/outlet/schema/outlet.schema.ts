import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { JobTypes } from '../interfaces/job.type';
import { IsEnum } from 'class-validator';

@Schema({ _id: false })
export class Modifier {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

export const ModifierSchema = SchemaFactory.createForClass(Modifier);

@Schema({ _id: false })
export class Town {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Town', default: null })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  towncode: string;

  @Prop({ required: false })
  region: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: false,
  })
  regionId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: false })
  area: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: false })
  areaId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: false })
  territory: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Territory',
    required: false,
  })
  territoryId: mongoose.Schema.Types.ObjectId;
}

export const TownSchema = SchemaFactory.createForClass(Town);

@Schema({ _id: false })
export class Route {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  routecode: string;

  @Prop({ required: true })
  name: string;
}

export const RouteSchema = SchemaFactory.createForClass(Route);

@Schema({ _id: false })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  usercode: string;

  @Prop({ required: false })
  kind: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: true, versionKey: false })
export class Outlet {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  outletcode: string;

  @Prop({ required: true })
  contactNo: string;

  @Prop({ required: true })
  channel: string;

  @Prop({ type: TownSchema })
  town: Town;

  @Prop({ type: RouteSchema })
  route: Route;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lon: number;

  @Prop({ type: UserSchema })
  user: User;

  @Prop({ type: Date, default: null })
  lastVisitedAt: Date;

  @Prop({ type: Number, default: null })
  lastOrderAmount: number;

  @Prop({ type: Boolean, default: false })
  lastOrderDelivered: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, default: null })
  lastOrderId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const OutletSchema = SchemaFactory.createForClass(Outlet);

OutletSchema.index({
  'town.id': 1,
  'route.routecode': 1,
  'user.id': 1,
});
