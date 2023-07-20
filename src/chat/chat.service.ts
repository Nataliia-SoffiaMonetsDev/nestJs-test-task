import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './models/chat.model';
import { ChatDto } from './dto/chat.dto';
import { Notification } from './models/notification.model';
import { User } from 'src/auth/auth.model';
import { NotificationDto } from './dto/notification.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    async getAllMessages(): Promise<ChatDto[]> {
        try {
            const messages = await this.messageModel.find();
            if (!messages) {
                throw new Error('Messages were not found.');
            }
            return messages;
        } catch (error) {
            throw error;
        }
    }

    async deleteAllNotifications(recipientId: string): Promise<void> {
        try {
            const id = new ObjectId(recipientId);
            const notification = await this.notificationModel.findOne({ recipientId: id });
            if (notification) {
                notification.messages = [];
                await notification.save();
            }
        } catch (error) {
            throw error;
        }
    }

    async getNotifications(): Promise<NotificationDto[]> {
        try {
            const notifications = await this.notificationModel.find();
            return notifications;
        } catch (error) {
            throw error;
        }
    }

    async deleteNotification(ids: string[]): Promise<NotificationDto[]> {
        try {
            const id = new ObjectId(ids[0]);
            const notification = await this.notificationModel.findOne({ recipientId: id });
            if (notification) {
                const deletedMessage = notification.messages.find((message) => message._id.toString() === ids[1]);
                if (deletedMessage) {
                    notification.messages = notification.messages.filter((message) => message._id.toString() !== ids[1]);
                    await notification.save();
                } else {
                    throw new Error('Notification not found');
                }
            } else {
                throw new Error('Notifications for this user were not found');
            }
            const notifications = await this.notificationModel.find();
            return notifications;
        } catch (error) {
            throw error;
        }
    }

    async sendMessage(data: ChatDto): Promise<ChatDto> {
        try {
            const users = await this.userModel.find();
            if (!users || users.length === 0) {
                throw new Error('No users found');
            }
            const messageData = await this.messageModel.create(data);
            for (const user of users) {
                if (user.userName !== data.userName) {
                    const notification = await this.notificationModel.findOne({ recipientId: user._id });
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
        } catch (error) {
            throw error;
        }
    }
}
