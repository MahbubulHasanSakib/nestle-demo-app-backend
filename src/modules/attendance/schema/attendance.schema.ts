import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import * as mongoose from 'mongoose';
import { EmployeeType } from '../interface/employee.type';
@Schema({ _id: false })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, enum: EmployeeType, required: true })
  @IsEnum(EmployeeType)
  kind: string;
}
const UserSchema = SchemaFactory.createForClass(User);

@Schema({ _id: false })
export class Image {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  original: string;

  @Prop({ type: String })
  thumb: string;
}
const ImageSchema = SchemaFactory.createForClass(Image);
@Schema({ timestamps: true, versionKey: false })
export class Attendance {
  @Prop({
    type: UserSchema,
    required: true,
  })
  user: User;

  @Prop({ type: Date, required: [true, 'punch in datetime is required'] })
  punchInAt: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Distribution',
  })
  townId: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Outlet',
  })
  outletId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: ImageSchema, required: true })
  image: Image;

  @Prop({ type: Date, default: null })
  firstExecutionAt: Date;

  @Prop({ type: Date, default: null })
  lastExecutionAt: Date;

  @Prop({ type: Number, required: [true, 'lat is required'] })
  lat: number;

  @Prop({ type: Number, required: [true, 'lon is required'] })
  lon: number;

  @Prop({ type: Date })
  punchOutAt: Date;

  @Prop({ type: Number })
  distance: number;

  @Prop({
    type: Boolean,
    required: false,
  })
  isFaceMatched: boolean;

  @Prop({
    type: Boolean,
    default: false,
    required: [true, 'within radius is required'],
  })
  withinRadius: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  late: boolean;

  @Prop({ required: false })
  appVersion: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

AttendanceSchema.index({
  townId: 1,
  'user.id': 1,
  punchInAt: -1,
});
