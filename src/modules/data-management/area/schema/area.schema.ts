import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Area {
  @Prop({ required: true })
  region: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true })
  regionId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

export const AreaSchema = SchemaFactory.createForClass(Area);
