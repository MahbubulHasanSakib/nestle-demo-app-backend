import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { LeaveKind } from '../interface/leave-kind.type';
import { LeaveStatusType } from '../interface/leave-status.type';
import { IsEnum } from 'class-validator';
import { UserType } from 'src/modules/user/interfaces/user.type';

@Schema({ _id: false })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, enum: UserType, required: false })
  @IsEnum(UserType)
  userType: string;
}

const UserSchema = SchemaFactory.createForClass(User);
@Schema()
export class LeaveItem {
  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;

  @Prop({ required: true })
  day: number;

  @Prop({ required: false })
  comment: string;

  @Prop({
    type: String,
    enum: LeaveStatusType,
    default: LeaveStatusType.UNSETTLE,
  })
  @IsEnum(LeaveStatusType)
  status: string;

  @Prop({ type: Date, default: null })
  notifiedAt: Date;

  @Prop({ type: Date, default: null })
  seenAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  modifier: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  modified: Date;

  @Prop({ type: String, default: null })
  modifiedOn: String;
}

const LeaveItemSchema = SchemaFactory.createForClass(LeaveItem);

@Schema({ timestamps: true, versionKey: false })
export class Leave {
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'Town',
  })
  townId: mongoose.Schema.Types.ObjectId[];

  @Prop({
    type: UserSchema,
    required: true,
  })
  user: User;

  @Prop({
    type: Number,
    required: true,
  })
  year: number;

  @Prop({
    type: Number,
  })
  remaining: number;

  @Prop({
    type: Number,
    default: 0,
  })
  consumed: number;

  @Prop({
    type: Number,
  })
  entitled: number;

  @Prop({
    type: String,
    enum: LeaveKind,
    required: true,
  })
  @IsEnum(LeaveKind)
  kind: string;

  @Prop({ required: true, type: [LeaveItemSchema] })
  leave: LeaveItem[];

  @Prop({ default: null })
  deletedAt: Date;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);

LeaveSchema.index({
  townId: 1,
  'user.id': 1,
  /*'leave.startAt': -1,
  'leave.endAt': -1,*/
});
