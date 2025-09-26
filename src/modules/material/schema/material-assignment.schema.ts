import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserType } from '../interfaces/user.type';
import * as mongoose from 'mongoose';

export type MaterialAssignmentDocument =
  mongoose.HydratedDocument<MaterialAssignment>;

@Schema({ _id: false })
export class Town {
  @Prop({ required: true })
  region: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Region' })
  regionId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  area: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Area' })
  areaId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  territory: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Territory' })
  territoryId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  towncode: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Town' })
  id: mongoose.Schema.Types.ObjectId;
}

export const TownSchema = SchemaFactory.createForClass(Town);

@Schema({ _id: false })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  usercode?: string;

  @Prop({
    type: String,
    enum: [
      UserType.ADMIN,
      UserType.AGENCY,
      UserType.CC,
      UserType.CM,
      UserType.DFF,
      UserType.MS,
      UserType.MTCM,
      UserType.RC,
      UserType.WMA,
    ],
    required: true,
  })
  type: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ _id: false })
export class Material {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Material' })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  company?: string;

  @Prop({ required: false })
  category?: string;

  @Prop({ required: false, default: 0 })
  remaining?: number;

  @Prop({ required: false, default: 0 })
  pending?: number;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

@Schema({ timestamps: true, versionKey: false })
export class MaterialAssignment {
  @Prop({ type: TownSchema })
  town: Town;

  @Prop({ type: UserSchema })
  user: User;

  @Prop({ type: [MaterialSchema] })
  material: Material[];

  @Prop({ required: true })
  modified: Date;
}

export const MaterialAssignmentSchema =
  SchemaFactory.createForClass(MaterialAssignment);

MaterialAssignmentSchema.index({
  'town.id': 1,
  'user.id': 1,
  createdAt: -1,
});
