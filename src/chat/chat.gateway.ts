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
    async getAllMessages(@ConnectedSocket() socket: Socket) {
        try {
            const messages = await this.chatService.getAllMessages();
            this.server.emit('allMessages', messages);
        } catch (error) {
            socket.emit('messageError', error.message || 'Failed to get all messages');
        }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(@MessageBody() data: ChatDto, @ConnectedSocket() socket: Socket) {
        try {
            const messageData = await this.chatService.sendMessage(data);
            this.server.emit('newMessage', messageData);
            socket.broadcast.emit('alertMessage', messageData);
        } catch (error) {
            socket.emit('messageError', error.message || 'Failed to send message');
        }
    }

    @SubscribeMessage('getNotifications')
    async getNotifications(@ConnectedSocket() socket: Socket) {
        try {
            const notifications = await this.chatService.getNotifications();
            this.server.emit('getAllNotifications', notifications);
        } catch (error) {
            socket.emit('notificationError', error.message || 'Failed to get notifications');
        }
    }

    @SubscribeMessage('deleteNotification')
    async deleteNotification(@MessageBody() ids: string[], @ConnectedSocket() socket: Socket) {
        try {
            const notifications = await this.chatService.deleteNotification(ids);
            this.server.emit('allNotificationsAfterDelete', notifications);
        } catch (error) {
            console.log(error)
            socket.emit('notificationError', error.message || 'Failed to delete notification');
        }
    }

    @SubscribeMessage('deleteAllNotifications')
    async deleteAllNotifications(@MessageBody() recipientId: string, @ConnectedSocket() socket: Socket) {
        try {
            await this.chatService.deleteAllNotifications(recipientId);
        } catch (error) {
            socket.emit('notificationError', error.message || 'Failed to delete all notifications');
        }
    }
}
