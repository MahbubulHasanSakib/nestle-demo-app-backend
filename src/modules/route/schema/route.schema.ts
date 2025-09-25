import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { JobType } from 'src/modules/execution/interface/job.type';
import { IsEnum } from 'class-validator';

@Schema({ _id: false })
export class Job {
  @Prop()
  @IsEnum(JobType)
  name: string;

  @Prop({ default: 0 })
  count: number;
}
export const JobSchema = SchemaFactory.createForClass(Job);

@Schema({ timestamps: true, versionKey: false })
export class Route {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  routecode: string;

  @Prop({ required: true })
  towncode: string;

  @Prop({ default: 0 })
  outletCount: number;

  @Prop({ required: true, type: [JobSchema] })
  job: Job[];

  @Prop({ default: null })
  deletedAt: Date;
}

export const RouteSchema = SchemaFactory.createForClass(Route);

RouteSchema.index({
  towncode: 1,
  routecode: 1,
});
