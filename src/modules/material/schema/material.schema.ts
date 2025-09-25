import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MaterialKind } from '../interfaces/material-kind.type';

@Schema({ _id: false })
export class Image {
  @Prop({ required: false })
  name: string;

  @Prop({ required: true })
  original: string;

  @Prop({ required: true })
  thumb: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);

@Schema({ timestamps: true, versionKey: false, discriminatorKey: 'kind' })
export class Material {
  @Prop({ required: true })
  owner: string;

  @Prop({ required: false })
  category: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  materialCode: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: ImageSchema })
  image: Image;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
