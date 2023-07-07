import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './models/chat.model';
import { ChatDto } from './dto/chat.dto';
import { Notification } from './models/notification.model';
import { User } from 'src/auth/auth.model';
import { NotificationDto } from './dto/notification.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    async getAllMessages(): Promise<ChatDto[]> {
        const messages = await this.messageModel.find();
        return messages;
    }

    async deleteAllNotifications(recipientId: string): Promise<void> {
        const notification = await this.notificationModel.findById(recipientId);
        if (notification) {
            notification.messages = [];
            await notification.save();
        }
    }

    async getNotifications(): Promise<NotificationDto[]> {
        const notifications = await this.notificationModel.find();
        return notifications;
    }

    async deleteNotification(ids: string[]): Promise<NotificationDto[]> {
        const notification = await this.notificationModel.findById(ids[0]);
        if (notification) {
            const deletedMessage = notification.messages.find((message) => message._id.toString() === ids[1]);
            if (deletedMessage) {
                notification.messages = notification.messages.filter((message) => message._id.toString() !== ids[1]);
                await notification.save();
            }
        }
        const notifications = await this.notificationModel.find();
        return notifications;
    }

    async sendMessage(data: ChatDto): Promise<ChatDto> {
        const messageData = new this.messageModel(data);
        await messageData.save();
        const users = await this.userModel.find();
        for (const user of users) {
            if (user.userName !== data.userName) {
                const notification = await this.notificationModel.findOne({ recipientId: user._id }).exec();
                if (notification) {
                    notification.messages.push(messageData);
                    await notification.save();
                } else {
                    const newNotification = new this.notificationModel({ recipientId: user._id, messages: [messageData] });
                    await newNotification.save();
                }
            }
        }
        return messageData;
    }
}
