import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserType } from '../interfaces/user.type';

export type CcUserDocument = mongoose.HydratedDocument<CcUser>;

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

@Schema({ _id: false })
export class Resignation {
  @Prop({ required: true })
  resignReason: string;

  @Prop({ type: Date, required: true })
  resignDate: Date;

  @Prop({ type: String, required: true })
  resignLetterUrl: string;
}

export const ResignationSchema = SchemaFactory.createForClass(Resignation);

@Schema({ _id: false })
export class Termination {
  @Prop({ required: true })
  terminationReason: string;

  @Prop({ type: Date, required: true })
  terminationDate: Date;

  @Prop({ type: String, required: true })
  terminationLetterUrl: string;
}

export const TerminationSchema = SchemaFactory.createForClass(Termination);

@Schema({ _id: false })
export class Warning {
  @Prop({ required: true })
  warningReason: string;

  @Prop({ type: Date, required: true })
  warningDate: Date;

  @Prop({ type: String, required: true })
  warningLetterUrl: string;
}

export const WarningSchema = SchemaFactory.createForClass(Warning);

@Schema({ _id: false })
export class NidPicture {
  @Prop({ required: true })
  original: string;

  @Prop({ required: true })
  thumb: string;
}

export const NidPictureSchema = SchemaFactory.createForClass(NidPicture);

@Schema({ _id: false })
export class MerchandisingExperience {
  @Prop({ type: Number, required: true })
  years: number;

  @Prop({ type: Number, required: true })
  months: number;
}

export const MerchandisingExperienceSchema = SchemaFactory.createForClass(
  MerchandisingExperience,
);

@Schema({ _id: false })
export class SalesExperience {
  @Prop({ type: Number, required: true })
  years: number;

  @Prop({ type: Number, required: true })
  months: number;
}

export const SalesExperienceSchema =
  SchemaFactory.createForClass(SalesExperience);

@Schema({ timestamps: true, versionKey: false })
export class CcUser {
  name: string;

  username: string;

  password: string;

  @Prop({ type: String, enum: ['Male', 'Female', 'Other'] })
  gender: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop()
  nidNumber: string;

  @Prop({ type: NidPictureSchema })
  nidPicture: NidPicture;

  @Prop()
  emergencyPhone: string;

  @Prop()
  address: string;

  @Prop({ type: MerchandisingExperienceSchema })
  merchandisingExperience: MerchandisingExperience;

  @Prop({ type: SalesExperienceSchema })
  salesExperience: SalesExperience;

  @Prop()
  joiningDate: Date;

  @Prop()
  previousCompany: string;

  @Prop()
  hiringReason: string;

  @Prop()
  additionalNotes: string;

  @Prop({ required: true })
  usercode: string;

  kind: UserType;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Town' }] })
  town: mongoose.Schema.Types.ObjectId[];

  phone: string;

  email: string;

  locked: boolean;

  attempt: number;

  image: Image;

  @Prop({ type: DeviceSchema, default: null })
  device: Device;

  modifier: mongoose.Schema.Types.ObjectId;

  @Prop({ type: ResignationSchema })
  resignation: Resignation;

  @Prop({ type: TerminationSchema, required: false })
  termination: Termination;

  @Prop({ type: WarningSchema, required: false })
  warning: Warning;

  deletedAt: Date;
}

export const CcUserSchema = SchemaFactory.createForClass(CcUser);
