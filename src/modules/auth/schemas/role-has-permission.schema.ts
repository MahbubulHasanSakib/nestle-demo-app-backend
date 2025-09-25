import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type RoleHasPermissionDocument =
  mongoose.HydratedDocument<RoleHasPermission>;

@Schema({ timestamps: true, versionKey: false })
export class RoleHasPermission {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    required: true,
  })
  permissions: mongoose.Schema.Types.ObjectId[];

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const RoleHasPermissionSchema =
  SchemaFactory.createForClass(RoleHasPermission);
