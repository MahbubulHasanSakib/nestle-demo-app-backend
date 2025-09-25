import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserType } from '../interfaces/user.type';

export type RcUserDocument = mongoose.HydratedDocument<RcUser>;

export class Image {
  @Prop({ required: true })
  original: string;

  @Prop({ required: true })
  thumb: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);

@Schema({ _id: false })
export class Device {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

@Schema({ timestamps: true, versionKey: false })
export class RcUser {
  name: string;

  username: string;

  password: string;

  @Prop({ required: true })
  usercode: string;

  kind: UserType;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Town' }] })
  town: mongoose.Schema.Types.ObjectId[];

  @Prop()
  phone: string;

  @Prop()
  email: string;

  locked: boolean;

  attempt: number;

  image: Image;

  @Prop({ type: DeviceSchema, default: null })
  device: Device;

  modifier: mongoose.Schema.Types.ObjectId;

  deletedAt: Date;
}

export const RcUserSchema = SchemaFactory.createForClass(RcUser);
