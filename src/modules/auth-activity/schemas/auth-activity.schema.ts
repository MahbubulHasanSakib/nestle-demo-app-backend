import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AuthActivityDocument = HydratedDocument<AuthActivity>;

@Schema({ _id: false })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  userType: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: true, versionKey: false })
export class AuthActivity {
  @Prop({ type: UserSchema, required: true })
  user: User;

  @Prop({ required: true })
  kind: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: false })
  lat: number;

  @Prop({ required: false })
  lon: number;

  @Prop({ required: true })
  device: string;

  @Prop({ required: false })
  deviceId: string;

  @Prop({ required: false })
  appVersion: string;

  @Prop()
  browser: string;

  @Prop({ required: true })
  success: boolean;

  @Prop({ required: true })
  at: Date;
}

export const AuthActivitySchema = SchemaFactory.createForClass(AuthActivity);
