import { Server, Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatDto } from './dto/chat.dto';
import * as mongoose from 'mongoose';
import { NotificationDto } from './dto/notification.dto';

describe('ChatGateway', () => {
    let chatGateway: ChatGateway;
    let chatService: ChatService;
    let mockServer: Server;
    let mockSocket: Socket;

    const mockChatService = {
        getAllMessages: jest.fn(),
        deleteAllNotifications: jest.fn(),
        getNotifications: jest.fn(),
        deleteNotification: jest.fn(),
        sendMessage: jest.fn()
    };

    const messages: ChatDto[] = [
        {
            date: '7 Jul 3:11 PM',
            message: 'message',
            userName: 'Name',
            _id: new mongoose.Types.ObjectId('64abcdee4ec1b2bc7dd0ed56')
        },
        {
            date: '7 Jul 3:11 PM',
            message: 'message',
            userName: 'Name',
            _id: new mongoose.Types.ObjectId('64abcdee4ec1b2bc7dd0ed55')
        }
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: ChatService,
                    useValue: mockChatService,
                },
            ]
        }).compile();

        chatService = module.get<ChatService>(ChatService);
        chatGateway = module.get<ChatGateway>(ChatGateway);
        mockServer = new Server();
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(chatGateway).toBeDefined();
    });

    it('should handle socket connection and disconnection', () => {
        expect(() => chatGateway.handleConnection(null)).not.toThrow();
        expect(() => chatGateway.handleDisconnect(null)).not.toThrow();
    });

    it('should handle getAllMessages and emit allMessages', async () => {
        mockServer.on('connection', async socket => {
            jest.spyOn(chatService, 'getAllMessages').mockResolvedValue(messages);
            await chatGateway.getAllMessages(socket);
            expect(chatService.getAllMessages).toHaveBeenCalled();
            expect(mockServer.emit).toHaveBeenCalledWith('allMessages', messages);
        });
    });

    it('should handle sendMessage and emit newMessage and alertMessage', async () => {
        mockServer.on('connection', async socket => {
            const message = messages[0];
            jest.spyOn(chatService, 'sendMessage').mockResolvedValue(message);

            await chatGateway.handleMessage(message, socket);

            expect(chatService.sendMessage).toHaveBeenCalledWith(message);
            expect(mockServer.emit).toHaveBeenCalledWith('newMessage', message);
            expect(socket.broadcast.emit).toHaveBeenCalledWith('alertMessage', messages);
        });
    });

    it('should handle getNotifications and emit getAllNotifications', async () => {
        mockServer.on('connection', async socket => {
            const notifications: NotificationDto[] = [
                {
                    recipientId: new mongoose.Types.ObjectId('64a7cbc9c8b6a84165a50c8f'),
                    messages: [
                        {
                            message: 'message',
                            userName: 'Name',
                            _id: new mongoose.Types.ObjectId('64abcdee4ec1b2bc7dd0ed55')
                        }
                    ],
                    _id: new mongoose.Types.ObjectId('64abcdee4ec1b2bc7dd0ed5b')
                }
            ];
            jest.spyOn(chatService, 'getNotifications').mockResolvedValue(notifications);
            await chatGateway.getNotifications(socket);
            expect(chatService.getNotifications).toHaveBeenCalled();
            expect(mockServer.emit).toHaveBeenCalledWith('getAllNotifications', notifications);
        });
    });

    it('should handle deleteNotification and emit allNotificationsAfterDelete', async () => {
        mockServer.on('connection', async socket => {
            const ids = ['64a7cbc9c8b6a84165a50c8f', '64abcdee4ec1b2bc7dd0ed55'];
            const notifications: NotificationDto[] = [
                {
                    recipientId: new mongoose.Types.ObjectId('64a7cbc9c8b6a84165a50c8f'),
                    messages: [
                        {
                            message: 'message',
                            userName: 'Name',
                            _id: new mongoose.Types.ObjectId('64abcdee4ec1b2bc7dd0ed55')
                        }
                    ],
                    _id: new mongoose.Types.ObjectId('64abcdee4ec1b2bc7dd0ed5b')
                }
            ];
            jest.spyOn(chatService, 'deleteNotification').mockResolvedValue(notifications);
            await chatGateway.deleteNotification(ids, socket);
            expect(chatService.deleteNotification).toHaveBeenCalledWith(ids);
            expect(mockServer.emit).toHaveBeenCalledWith('allNotificationsAfterDelete', notifications);
        });
    });

    it('should handle deleteAllNotifications', async () => {
        const recipientId = '64a7cbc9c8b6a84165a50c8f';
        await chatGateway.deleteAllNotifications(recipientId, mockSocket);
        expect(chatService.deleteAllNotifications).toHaveBeenCalledWith(recipientId);
    });

});