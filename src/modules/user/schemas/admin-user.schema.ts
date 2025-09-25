import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserType } from '../interfaces/user.type';

export type AdminUserDocument = mongoose.HydratedDocument<AdminUser>;

export class Image {
  @Prop({ required: true })
  original: string;

  @Prop({ required: true })
  thumb: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);

@Schema({ _id: false })
export class Setting {
  @Prop()
  refreshTime: number;

  @Prop()
  sessionTimeOut: number;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);

@Schema({ timestamps: true, versionKey: false })
export class AdminUser {
  name: string;

  username: string;

  password: string;

  kind: UserType;

  @Prop({
    type: String,
    required: false,
  })
  designation: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
    required: true,
  })
  landingPage: mongoose.Schema.Types.ObjectId;

  phone: string;

  email: string;

  locked: boolean;

  attempt: number;

  image: Image;

  @Prop({
    type: SettingSchema,
    default: { refreshTime: 0, sessionTimeOut: 20 },
  })
  setting: Setting;

  modifier: mongoose.Schema.Types.ObjectId;

  deletedAt: Date;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
