import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserRoleDocument = mongoose.HydratedDocument<UserRole>;

@Schema({ timestamps: true, versionKey: false })
export class UserRole {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  })
  roleId: mongoose.Schema.Types.ObjectId;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Region' }])
  regionId: mongoose.Schema.Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Area' }])
  areaId: mongoose.Schema.Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Territory' }])
  territoryId: mongoose.Schema.Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Town' }])
  townId: mongoose.Schema.Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  msId: mongoose.Schema.Types.ObjectId[];

  @Prop([{ type: String }])
  projectAccess: String[];

  // @Prop({
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  // })
  // modifier: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);
