import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  formattedPhoneNumber: string;

  @Prop({ required: true })
  lid: string;

  @Prop({ required: true })
  pn: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
