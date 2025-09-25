import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: false, versionKey: false, strict: false })
export class Draft extends Document {}
export const DraftSchema = SchemaFactory.createForClass(Draft);
