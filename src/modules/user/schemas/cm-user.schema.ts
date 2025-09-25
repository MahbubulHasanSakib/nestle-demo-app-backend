import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserType } from '../interfaces/user.type';

export type CmUserDocument = mongoose.HydratedDocument<CmUser>;

@Schema({ _id: false })
export class NidPicture {
  @Prop({ required: true })
  original: string;

  @Prop({ required: true })
  thumb: string;
}

export const NidPictureSchema = SchemaFactory.createForClass(NidPicture);

export class Image {
  @Prop({ required: true })
  original: string;

  @Prop({ required: true })
  thumb: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);

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

@Schema({ _id: false })
export class Components {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  weight: number;

  @Prop({ type: Number, required: true })
  passed: number;

  @Prop({ type: Number, required: true })
  multiplier: number;
}

export const ComponentsSchema = SchemaFactory.createForClass(Components);

@Schema({ _id: false })
export class VariablePayDistribution {
  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: Number, required: true })
  categoryWeight: number;

  @Prop({ type: [Components], default: [] })
  components: Components[];
}

export const VariablePayDistributionSchema = SchemaFactory.createForClass(
  VariablePayDistribution,
);

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
export class Device {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

@Schema({ timestamps: true, versionKey: false })
export class CmUser {
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

  email: string;

  phone: string;

  @Prop()
  emergencyPhone: string;

  @Prop()
  address: string;

  kind: UserType;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Town' }] })
  town: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  supervisor: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  usercode: string;

  locked: boolean;

  attempt: number;

  @Prop()
  joiningDate: Date;

  image: Image;

  @Prop({ type: MerchandisingExperienceSchema })
  merchandisingExperience: MerchandisingExperience;

  @Prop({ type: SalesExperienceSchema })
  salesExperience: SalesExperience;

  @Prop()
  basicSalary: number;

  @Prop()
  variablePay: number;

  @Prop()
  travelAllowance: number;

  @Prop({ default: 0 })
  mobileAllowance: number;

  @Prop()
  previousCompany: string;

  @Prop()
  hiringReason: string;

  @Prop()
  additionalNotes: string;

  @Prop()
  totalSalary: number;

  @Prop()
  accountNo: string;

  @Prop()
  routingNo: string;

  @Prop()
  branchName: string;

  @Prop({ default: 0 })
  specialBonus: number;

  @Prop({ default: 'Active' })
  status: string;

  @Prop({ type: [VariablePayDistributionSchema], default: [] })
  variablePayDistribution: VariablePayDistribution[];

  @Prop({ type: ResignationSchema })
  resignation: Resignation;

  @Prop({ type: TerminationSchema, required: false })
  termination: Termination;

  @Prop({ type: WarningSchema, required: false })
  warning: Warning;

  @Prop({ type: DeviceSchema, default: null })
  device: Device;

  modifier: mongoose.Schema.Types.ObjectId;

  deletedAt: Date;

  createdAt: Date;

  updatedAt: Date;
}

export const CmUserSchema = SchemaFactory.createForClass(CmUser);
