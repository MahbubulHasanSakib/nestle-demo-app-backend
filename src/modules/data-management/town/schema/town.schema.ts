import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ _id: false })
export class WorkingDaysInMonth {
  @Prop({ required: true })
  month: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  totalWorkingDays: number;
}

export const WorkingDaysInMonthSchema =
  SchemaFactory.createForClass(WorkingDaysInMonth);

@Schema({ timestamps: true, versionKey: false })
export class Town {
  @Prop({ required: true })
  region: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Region', required: true })
  regionId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  area: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true })
  areaId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  territory: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Territory',
    required: true,
  })
  territoryId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: [WorkingDaysInMonthSchema],
    default: [],
  })
  workingDaysInMonth: WorkingDaysInMonth[];

  @Prop({ required: false })
  towncode: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lon: number;
}

export const TownSchema = SchemaFactory.createForClass(Town);
