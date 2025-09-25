import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserType } from '../interfaces/user.type';

export type AgencyUserDocument = mongoose.HydratedDocument<AgencyUser>;

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
export class AgencyUser {
  name: string;

  username: string;

  password: string;

  @Prop({ required: true })
  usercode: string;

  kind: UserType;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Town' }] })
  town: mongoose.Schema.Types.ObjectId[];

  phone: string;

  email: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  supervisor: mongoose.Schema.Types.ObjectId;

  locked: boolean;

  attempt: number;

  image: Image;

  @Prop({ type: DeviceSchema, default: null })
  device: Device;

  modifier: mongoose.Schema.Types.ObjectId;

  deletedAt: Date;
}

export const AgencyUserSchema = SchemaFactory.createForClass(AgencyUser);
