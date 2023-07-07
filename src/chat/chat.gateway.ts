import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatDto } from './dto/chat.dto';
import { ChatService } from './chat.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private chatService: ChatService
    ) { }

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
        const messages = await this.chatService.getAllMessages();
        this.server.emit('allMessages', messages);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(@MessageBody() data: ChatDto, @ConnectedSocket() socket: Socket) {
        const messageData = await this.chatService.sendMessage(data);
        this.server.emit('newMessage', messageData);
        socket.broadcast.emit('alertMessage', messageData);
    }

    @SubscribeMessage('getNotifications')
    async getNotifications() {
        const notifications = await this.chatService.getNotifications();
        this.server.emit('getAllNotifications', notifications);
    }

    @SubscribeMessage('deleteNotification')
    async deleteNotification(@MessageBody() ids: string[]) {
        const notifications = await this.chatService.deleteNotification(ids);
        this.server.emit('allNotificationsAfterDelete', notifications);
    }

    @SubscribeMessage('deleteAllNotifications')
    async deleteAllNotifications(@MessageBody() recipientId: string) {
        await this.chatService.deleteAllNotifications(recipientId);
    }
}
