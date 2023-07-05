import { InjectModel } from '@nestjs/mongoose';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Message } from './chat.model';
import { Model } from 'mongoose';
import { ChatDto } from './dto/chat.dto';

@WebSocketGateway({ cors: { orgin: ['http://localhost:4200'] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>
    ) {}

    @WebSocketServer()
    server: Server

    handleConnection(client: any, ...args: any[]) {
        console.log('connection made');
    }

    handleDisconnect(client: any) {
        console.log('disconnected');
    }

    @SubscribeMessage('getAllMessages')
    async getAllMessages() {
        const messages = await this.messageModel.find();
        this.server.emit('allMessages', messages);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(@MessageBody() data: ChatDto) {
        const messageData = new this.messageModel(data);
        await messageData.save();
        this.server.emit('newMessage', data);
    }
}
