import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true, versionKey: false })
export class Permission {
  @Prop({ required: true })
  module: string;

  @Prop()
  submodule: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
