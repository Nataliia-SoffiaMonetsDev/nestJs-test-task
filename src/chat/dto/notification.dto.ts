import * as mongoose from 'mongoose';

export class NotificationDto {
    readonly messages: { 
        userName: String,
        message: String,
        _id: mongoose.Types.ObjectId
    }[];

    readonly recipientId: mongoose.Types.ObjectId;

    readonly _id?: mongoose.Types.ObjectId;
}