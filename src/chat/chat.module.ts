import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './models/chat.model';
import { Notification, NotificationSchema } from './models/notification.model';
import { User, UserSchema } from 'src/auth/auth.model';
import { ChatService } from './chat.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
        MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    providers: [ChatGateway, ChatService]
})
export class ChatModule { }
