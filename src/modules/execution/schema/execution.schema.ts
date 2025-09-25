import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ExecutionCallType } from '../interface/execution-call.type';
import { IsEnum } from 'class-validator';
import { ImageKind } from '../interface/image-kind.type';
import { JobType } from '../interface/job.type';
import { NoExecutionReason } from '../interface/no-execution-reason.type';
import { DeliveryMethod } from '../interface/delivery-method.type';
import { PaymentMethod } from '../interface/payment-method.type';
@Schema({ _id: false })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  usercode: string;

  @Prop({ type: String, required: true })
  userType: string;
}
const UserSchema = SchemaFactory.createForClass(User);
@Schema({ _id: false })
export class Outlet {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Outlet' })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  channel: string;

  @Prop({ type: String, required: true })
  route: string;

  @Prop({ type: String, required: false })
  routecode: string;

  @Prop({ type: String, required: true })
  outletcode: string;

  @Prop({ type: String, required: false })
  contactNo: string;

  @Prop({ type: Number, required: true })
  lat: number;

  @Prop({ type: Number, required: true })
  lon: number;
}
const OutletSchema = SchemaFactory.createForClass(Outlet);

@Schema({ _id: false })
export class Town {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Town',
  })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  region: string;

  @Prop({ type: String, required: true })
  area: string;

  @Prop({ type: String, required: true })
  territory: string;

  @Prop({ type: String, required: true })
  towncode: string;
}
const TownSchema = SchemaFactory.createForClass(Town);

@Schema({ _id: false })
export class Image {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  original: string;

  @Prop({ required: true })
  thumb: string;

  @Prop({ enum: ImageKind, required: true })
  @IsEnum(ImageKind)
  kind: string;
}

const ImageSchema = SchemaFactory.createForClass(Image);

@Schema({ _id: false })
export class SkuItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  detectedQty: number;
}

const SkuItemSchema = SchemaFactory.createForClass(SkuItem);

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Outlet' })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  qty: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ required: true })
  size: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true, versionKey: false })
export class Execution {
  @Prop({ type: UserSchema, required: true })
  user: User;

  @Prop({ type: OutletSchema, required: true })
  outlet: Outlet;

  @Prop({ type: TownSchema, required: true })
  town: Town;

  @Prop({ type: Date, required: true })
  executionStartAt: Date;

  @Prop({ type: Date, required: true })
  executionEndAt: Date;

  @Prop({ type: String, required: true })
  duration: string;

  @Prop({ type: [ImageSchema], required: false })
  image: Image[];

  @Prop({ type: [SkuItemSchema], required: false })
  detectedItems: SkuItem[];

  @Prop({ type: [OrderItemSchema], required: true })
  orderItems: OrderItem[];

  @Prop({ required: true })
  totalOrderedAmount: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ type: String, default: null, enum: DeliveryMethod })
  deliveryType: DeliveryMethod;

  @Prop({ type: Date, default: null })
  deliveryDate: Date;

  @Prop({ type: String, default: null, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop({ type: Boolean, default: false })
  delivered: boolean;

  @Prop({ type: Boolean, required: false })
  withinRadius: boolean;

  @Prop({ type: Number, required: false })
  lat: number;

  @Prop({ type: Number, required: false })
  lon: number;

  @Prop({ type: Number, required: false })
  distance: number;

  @Prop({ default: null })
  deletedAt: Date;
}

export const ExecutionSchema = SchemaFactory.createForClass(Execution);

ExecutionSchema.index({
  'town.id': 1,
  'outlet.routecode': 1,
  'user.id': 1,
  executionEndAt: -1,
});
