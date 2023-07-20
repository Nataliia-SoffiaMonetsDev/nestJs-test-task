import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Message } from './models/chat.model';
import { ChatService } from './chat.service';
import { User } from 'src/auth/auth.model';
import { Notification } from './models/notification.model';
import * as mongoose from 'mongoose';

describe('ChatService', () => {
    let service: ChatService;
    let messageModel: Model<Message>;
    let notificationModel: Model<Notification>;
    let userModel: Model<User>;

    const notifications = [
        {
            recipientId: '64a7cbc9c8b6a84165a50c8f',
            messages: [
                {
                    date: '7 Jul 3:11 PM',
                    message: 'message',
                    userName: 'Name',
                    _id: '64abcdee4ec1b2bc7dd0ed55',
                },
                {
                    date: '8 Jul 3:11 PM',
                    message: 'message2',
                    userName: 'Name',
                    _id: '64abcdee4ec1b2bc7dd0ed56',
                },
            ],
            _id: '64abcdee4ec1b2bc7dd0ed5b',
        },
    ];

    const messages = [
        {
            date: '7 Jul 3:11 PM',
            message: 'message',
            userName: 'Name',
        },
        {
            date: '8 Jul 3:11 PM',
            message: 'message1',
            userName: 'Test',
        }
    ];

    const mockDocument = {
        save: jest.fn(),
    };

    const mockModel = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(message => ({
            ...message,
            _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6')
        })),
        prototype: { save: jest.fn(value => value) }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: getModelToken(Message.name),
                    useValue: mockModel
                },
                {
                    provide: getModelToken(Notification.name),
                    useValue: mockModel
                },
                {
                    provide: getModelToken(User.name),
                    useValue: mockModel
                }
            ]
        }).compile();

        service = module.get<ChatService>(ChatService);
        messageModel = module.get<Model<Message>>(getModelToken(Message.name));
        notificationModel = module.get<Model<Notification>>(getModelToken(Notification.name));
        userModel = module.get<Model<User>>(getModelToken(User.name));

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllMessages', () => {
        it('should return an array of messages', async () => {
            jest.spyOn(messageModel, 'find').mockResolvedValue(messages);
            const result = await service.getAllMessages();
            expect(result).toEqual(messages);
            expect(messageModel.find).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if messages are not found', async () => {
            jest.spyOn(messageModel, 'find').mockResolvedValue(null);
            await expect(service.getAllMessages()).rejects.toThrowError('Messages were not found.');
            expect(messageModel.find).toHaveBeenCalledTimes(1);
        });
    });

    describe('deleteAllNotifications', () => {
        it('should delete notifications successfully', async () => {
            jest.spyOn(notificationModel, 'findOne').mockResolvedValue(mockDocument);
            jest.spyOn(mockDocument, 'save').mockResolvedValue(null);
            await service.deleteAllNotifications('64a7cbc9c8b6a84165a50c8f');
            expect(notificationModel.findOne).toHaveBeenCalledTimes(1);
            expect(mockDocument.save).toHaveBeenCalledTimes(1);
        });

        it('should not delete if the notification is not found', async () => {
            jest.spyOn(notificationModel, 'findOne').mockResolvedValue(null);
            await service.deleteAllNotifications('64a7cbc9c8b6a84165a50c8f');
            expect(notificationModel.findOne).toHaveBeenCalledTimes(1);
            expect(notificationModel.prototype.save).not.toHaveBeenCalled();
        });
    });

    describe('getNotifications', () => {
        it('should return an array of notifications', async () => {
            jest.spyOn(notificationModel, 'find').mockResolvedValue(notifications);
            const result = await service.getNotifications();
            expect(result).toEqual(notifications);
            expect(notificationModel.find).toHaveBeenCalledTimes(1);
        });

        it('should return an empty array if no notifications are found', async () => {
            jest.spyOn(notificationModel, 'find').mockResolvedValue([]);
            const result = await service.getNotifications();
            expect(result).toEqual([]);
            expect(notificationModel.find).toHaveBeenCalledTimes(1);
        });
    });

    describe('deleteNotification', () => {
        it('should delete a notification', async () => {
            const notificationId = '64abcdee4ec1b2bc7dd0ed5b';
            const recipientId = '64a7cbc9c8b6a84165a50c8f';
            const notificationsAfterDelete = [
                {
                    recipientId,
                    messages: [
                        {
                            date: '8 Jul 3:11 PM',
                            message: 'message2',
                            userName: 'Name',
                            _id: '64abcdee4ec1b2bc7dd0ed56',
                        },
                    ],
                    _id: notificationId,
                },
            ];
            jest.spyOn(notificationModel, 'findOne').mockResolvedValue({ ...mockDocument, ...notifications[0] });
            jest.spyOn(mockDocument, 'save').mockResolvedValue(null);
            jest.spyOn(notificationModel, 'find').mockResolvedValue(notificationsAfterDelete);
            const result = await service.deleteNotification([
                recipientId,
                '64abcdee4ec1b2bc7dd0ed55',
            ]);
            expect(notificationModel.findOne).toHaveBeenCalledTimes(1);
            expect(mockDocument.save).toHaveBeenCalledTimes(1);
            expect(notificationModel.find).toHaveBeenCalled();
            expect(result).toEqual(notificationsAfterDelete);
        });

        it('should throw an error if notification is not found', async () => {
            jest.spyOn(notificationModel, 'findOne').mockResolvedValue({ ...mockDocument, ...notifications[0] });
            await expect(service.deleteNotification(['64a7cbc9c8b6a84165a50c8f', '64abcdee4ec1b2bc7dd0ed23'])
            ).rejects.toThrowError('Notification not found');
            expect(notificationModel.findOne).toHaveBeenCalledTimes(1);
            expect(mockDocument.save).not.toHaveBeenCalled();
        });

        it('should throw an error if notifications for the user is not found', async () => {
            const recipientId = '64a7cbc9c8b6a84165a50c8f';
            jest.spyOn(notificationModel, 'findOne').mockResolvedValue(null);
            await expect(service.deleteNotification([recipientId, '64abcdee4ec1b2bc7dd0ed55'])).rejects.toThrowError('Notifications for this user were not found');
            expect(notificationModel.findOne).toHaveBeenCalledTimes(1);
            expect(mockDocument.save).not.toHaveBeenCalled();
        });
    });

    describe('sendMessage', () => {
        it('should send a message and create notifications', async () => {
            const users = [
                {
                    userName: 'Name',
                    email: 'email@mail.com',
                    password: 'password',
                    _id: '64870f92e622309b8eaa38f6',
                },
                {
                    userName: 'Name1',
                    email: 'email1@mail.com',
                    password: 'password',
                    _id: '64870f92e622309b8eaa38f6',
                },
            ];

            jest.spyOn(userModel, 'find').mockResolvedValue(users);
            jest.spyOn(messageModel, 'create');
            jest.spyOn(notificationModel, 'findOne').mockResolvedValue({ ...mockDocument, ...notifications[0] });
            jest.spyOn(mockDocument, 'save').mockResolvedValue(null);
            const result = await service.sendMessage(messages[0]);
            expect(userModel.find).toHaveBeenCalledTimes(1);
            expect(notificationModel.findOne).toHaveBeenCalledTimes(1);
            expect(mockDocument.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ ...messages[0], _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6')});
        });

        it('should throw an error if no users are found', async () => {
            jest.spyOn(userModel, 'find').mockResolvedValue([]);
            await expect(service.sendMessage(messages[0])).rejects.toThrowError('No users found');
            expect(userModel.find).toHaveBeenCalledTimes(1);
            expect(notificationModel.findOne).not.toHaveBeenCalled();
            expect(mockDocument.save).not.toHaveBeenCalled();
        });
    });

});