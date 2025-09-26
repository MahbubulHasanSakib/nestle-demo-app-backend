import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

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

  @Prop({ required: false })
  towncode: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Town', default: null })
  id: mongoose.Schema.Types.ObjectId;
}

export const TownSchema = SchemaFactory.createForClass(Town);

@Schema({ _id: false })
export class Material {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    default: null,
  })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, default: 0 })
  remaining: number;

  @Prop({ required: true, default: 0 })
  pending: number;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

@Schema({ timestamps: true, versionKey: false })
export class TownMaterial {
  @Prop({ type: TownSchema })
  town: Town;

  @Prop({ type: [MaterialSchema] })
  material: Material[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  modifier: mongoose.Schema.Types.ObjectId;
}

export const TownMaterialSchema = SchemaFactory.createForClass(TownMaterial);

TownMaterialSchema.index({
  'town.id': 1,
});
