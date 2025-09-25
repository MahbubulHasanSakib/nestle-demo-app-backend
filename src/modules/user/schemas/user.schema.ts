import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserType } from '../interfaces/user.type';

export type UserDocument = mongoose.HydratedDocument<User>;
@Schema({ _id: false })
export class Image {
  @Prop({ required: true })
  original: string;

  @Prop({ required: true })
  thumb: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);

@Schema({ _id: false })
export class PasswordChangedHistory {
  @Prop({ type: Date, required: false })
  changedAt: Date;

  @Prop({ required: false })
  password: string;
}

export const PasswordChangedHistorySchema = SchemaFactory.createForClass(
  PasswordChangedHistory,
);

@Schema({ discriminatorKey: 'kind', timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: [UserType.CM, UserType.MS, UserType.ADMIN],
    required: true,
  })
  kind: UserType;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ default: false })
  locked: boolean;

  @Prop({ required: false })
  isSuspended: boolean;

  @Prop({ required: false })
  requireNewPassword: boolean;

  @Prop({ type: Boolean, default: false })
  forgetPassword: boolean;

  @Prop({ type: String, required: false })
  tempPassword: string;

  @Prop({ type: Number, required: false })
  otp: number;

  @Prop({ type: Date, required: false })
  otpGeneratedAt: Date;

  @Prop({ type: [PasswordChangedHistory], required: false })
  passwordHistory: PasswordChangedHistory[];

  @Prop({ default: 0 })
  attempt: number;

  @Prop({ type: ImageSchema })
  image: Image;

  @Prop({ ref: 'User' })
  modifier: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ username: 1, kind: 1 });
UserSchema.index({ usercode: 1 });
