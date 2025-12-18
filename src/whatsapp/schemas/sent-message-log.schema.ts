import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SentMessageLogDocument = HydratedDocument<SentMessageLog>;

@Schema({ timestamps: true })
export class SentMessageLog {
  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  text: string;
}

export const SentMessageLogSchema =
  SchemaFactory.createForClass(SentMessageLog);
