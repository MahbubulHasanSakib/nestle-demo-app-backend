import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Territory {
  @Prop({ required: true })
  region: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true })
  regionId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  area: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true })
  areaId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

export const TerritorySchema = SchemaFactory.createForClass(Territory);
