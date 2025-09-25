import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { SummaryKind } from '../interfaces/summary-kind.type';
import { IsEnum } from 'class-validator';

@Schema({ _id: false })
export class TownMaterial {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Material' })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, default: 0 })
  allocated: number;

  @Prop({ required: true, default: 0 })
  assigned: number;

  @Prop({ required: true, default: 0 })
  accept: number;

  @Prop({ required: true, default: 0 })
  send: number;

  @Prop({ required: true, default: 0 })
  receive: number;

  @Prop({ required: true, default: 0 })
  remaining: number;

  @Prop({ required: true, default: 0 })
  used: number;

  @Prop({ required: true, default: 0 })
  damage: number;

  @Prop({ required: true, default: 0 })
  lost: number;

  @Prop({ required: true, default: 0 })
  return: number;
}

export const TownMaterialSchema = SchemaFactory.createForClass(TownMaterial);

@Schema({ _id: false })
export class UserMaterial {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Material' })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, default: 0 })
  allocated: number;

  @Prop({ required: true, default: 0 })
  accept: number;

  @Prop({ required: true, default: 0 })
  remaining: number;

  @Prop({ required: true, default: 0 })
  used: number;

  @Prop({ required: true, default: 0 })
  return: number;

  @Prop({ required: true, default: 0 })
  damage: number;

  @Prop({ required: true, default: 0 })
  lost: number;
}

export const UserMaterialSchema = SchemaFactory.createForClass(UserMaterial);

@Schema({ _id: false })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  userType: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: true, versionKey: false, discriminatorKey: 'kind' })
export class Summary {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Town' })
  townId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: UserSchema })
  user: User;

  @Prop({ required: true })
  day: Date;

  @Prop({
    type: String,
    enum: [SummaryKind.TOWN, SummaryKind.USER],
    required: true,
  })
  @IsEnum(SummaryKind)
  kind: string;
}

export const SummarySchema = SchemaFactory.createForClass(Summary);

@Schema()
export class TownSummary {
  @Prop({ type: [TownMaterialSchema] })
  material: TownMaterial[];
}

export const TownSummarySchema = SchemaFactory.createForClass(TownSummary);

@Schema()
export class UserSummary {
  @Prop({ type: [UserMaterialSchema] })
  material: UserMaterial[];
}

export const UserSummarySchema = SchemaFactory.createForClass(UserSummary);

SummarySchema.index({
  townId: 1,
  'user.id': 1,
  day: -1,
});
