import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  phoneNumber: string;

  @Prop()
  formattedPhoneNumber: string;

  @Prop()
  lid: string;

  @Prop()
  pn: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
