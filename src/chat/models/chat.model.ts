import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageData = HydratedDocument<Message>;

@Schema()
export class Message {
    @Prop({ type: String, required: true })
    message: string;

    @Prop({ type: String, required: true })
    userName: string;

    @Prop({ type: String, required: true })
    date: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);