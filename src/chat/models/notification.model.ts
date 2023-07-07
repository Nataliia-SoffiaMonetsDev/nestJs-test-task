import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Message } from './chat.model';
import * as mongoose from 'mongoose';

export type NotificationData = HydratedDocument<Notification>;

@Schema()
export class Notification {

    @Prop({ type: mongoose.Types.ObjectId, required: true })
    recipientId: mongoose.Types.ObjectId;

    @Prop({ type: [{ userName: String, message: String, date: String, _id: mongoose.Types.ObjectId }], required: true })
    messages: { 
        userName: String,
        message: String,
        _id: mongoose.Types.ObjectId
    }[];

}

export const NotificationSchema = SchemaFactory.createForClass(Notification);