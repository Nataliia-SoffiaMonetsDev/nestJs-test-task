import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { TokenService } from './token.service';
import { Token } from './token.model';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
    let service: TokenService;
    let model: Model<Token>;
    let jwtService: JwtService;

    const tokenData = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTQyYjg0YmEzMzJhZDA4YTM4MDQ1ZCIsImVtYWlsIjoibmF0YUBtYWlsLmNvbSIsImlhdCI6MTY4OTY4MjY2OSwiZXhwIjoxNjg5NzI1ODY5fQ.qpff_tPB1p6AnuLeixLI1FcQGl6WwH0Kq1f9_LtNKnU',
        user: new mongoose.Types.ObjectId("64a42b84ba332ad08a38045d"),
        _id: new mongoose.Types.ObjectId("64b682ed5ffad3dd03845d33")
    }

    const mockModel = {
        findOne: jest.fn(),
        create: jest.fn(data => ({
            ...data,
            _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6')
        })),
        find: jest.fn(),
        deleteOne: jest.fn(),
        prototype: { save: jest.fn() }
    };

    const mockJwtService = {
        sign: jest.fn(() => tokenData.token),
        verify: jest.fn(() => ({
            id: new mongoose.Types.ObjectId("64a42b84ba332ad08a38045d"),
            email: 'test@mail.com',
            iat: 1689683064,
            exp: 1689726264
        }))
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                {
                    provide: getModelToken(Token.name),
                    useValue: mockModel
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ]
        }).compile();

        service = module.get<TokenService>(TokenService);
        model = module.get<Model<Token>>(getModelToken(Token.name));
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate a new access token', async () => {
        const userId = tokenData.user;
        const email = 'test@mail.com';
        jest.spyOn(jwtService, 'sign');
        const result = service.generateAccessToken(userId, email);
        expect(result).toEqual(tokenData.token);
        expect(jwtService.sign).toHaveBeenCalledWith({ id: userId, email });
    });

    it('should save the new token', async () => {
        const userId = tokenData.user;
        const token = tokenData.token;
        jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);
        jest.spyOn(model, 'create');
        jest.spyOn(model.prototype, 'save')
        const result = await service.saveToken(userId, token);
        expect(result).toEqual({
            token: token,
            user: userId,
            _id: expect.any(mongoose.Types.ObjectId)
        });
        expect(model.findOne).toHaveBeenCalledWith({ user: userId });
        expect(model.prototype.save).not.toHaveBeenCalled();
        expect(model.create).toHaveBeenCalled();
    });

    it('should remove the token', async () => {
        const token = tokenData.token;
        jest.spyOn(model, 'deleteOne').mockResolvedValueOnce({ acknowledged: true, deletedCount: 1 });
        const result = await service.removeToken(token);
        expect(result).toEqual({ acknowledged: true, deletedCount: 1 });
        expect(model.deleteOne).toHaveBeenCalledWith({ token });
    });

    it('should validate the token', async () => {
        const token = tokenData.token;
        jest.spyOn(jwtService, 'verify')
        const result = await service.validateAccessToken(token);
        expect(result).toEqual({
            id: new mongoose.Types.ObjectId("64a42b84ba332ad08a38045d"),
            email: 'test@mail.com',
            iat: 1689683064,
            exp: 1689726264
        });
        expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should get the token', async () => {
        const token = tokenData.token;
        jest.spyOn(model, 'findOne').mockResolvedValueOnce(tokenData)
        const result = await service.findToken(token);
        expect(result).toEqual(tokenData);
        expect(model.findOne).toHaveBeenCalledWith({ token });
    });

});