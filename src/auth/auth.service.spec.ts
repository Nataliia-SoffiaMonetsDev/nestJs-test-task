import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokenService } from 'src/token/token.service';
import { User } from './auth.model';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as mongoose from 'mongoose';

describe('AuthService', () => {
    let service: AuthService;
    let model: Model<User>;
    const user = {
        userName: 'Name',
        email: 'email@mail.com',
        password: 'password'
    };
    const tokenService = {
        generateAccessToken: jest.fn(() => ('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTQyYjg0YmEzMzJhZDA4YTM4MDQ1ZCIsImVtYWlsIjoibmF0YUBtYWlsLmNvbSIsImlhdCI6MTY4OTE0NjU0OSwiZXhwIjoxNjg5MTg5NzQ5fQ.hh6Hyef7a7nYoWZUkO7bVxN8ikhBDckREx6uezWxfFU')),
        saveToken: jest.fn(() => Promise.resolve()),
        removeToken: jest.fn(() => Promise.resolve({ acknowledged: true, deletedCount: 1 }))
    };
    const mockModel = {
        findOne: jest.fn(),
        create: jest.fn(user => ({
            ...user,
            _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6')
        })),
        find: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockModel
                },
                TokenService
            ]
        }).overrideProvider(TokenService).useValue(tokenService).compile();

        service = module.get<AuthService>(AuthService);
        model = module.get<Model<User>>(getModelToken(User.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Register', () => {
        it('should register a new user', async () => {
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(bcrypt, 'hashSync').mockReturnValueOnce(user.password);
            jest.spyOn(model, 'create');
            const result = await service.register(user);
            expect(model.findOne).toHaveBeenCalledWith({ email: user.email });
            expect(model.findOne).toHaveBeenCalledWith({ userName: user.userName });
            expect(bcrypt.hashSync).toHaveBeenCalledWith(user.password, 5);
            expect(model.create).toHaveBeenCalledWith(user);
            expect(result).toEqual({ ...user, _id: new mongoose.Types.ObjectId('64870f92e622309b8eaa38f6') });
        });

        it('should throw an error if the user already exists', async () => {
            const existingUser = { email: user.email };
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(existingUser);
            jest.spyOn(model, 'create');
            jest.spyOn(bcrypt, 'hashSync');
            await expect(service.register(user)).rejects.toThrowError(
                new HttpException('User already exists', HttpStatus.BAD_REQUEST)
            );
            expect(model.findOne).toHaveBeenCalledWith({ email: user.email });
            expect(bcrypt.hashSync).not.toHaveBeenCalled();
            expect(model.create).not.toHaveBeenCalled();
        });

        it('should throw an error if the username is not unique', async () => {
            const isNameUnique = { userName: 'Name', email: 'email@mail.com', password: 'password' };
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(isNameUnique);
            jest.spyOn(model, 'create');
            jest.spyOn(bcrypt, 'hashSync');
            await expect(service.register(user)).rejects.toThrowError(
                new HttpException('User name should be unique', HttpStatus.BAD_REQUEST)
            );
            expect(model.findOne).toHaveBeenCalledWith({ email: user.email });
            expect(model.findOne).toHaveBeenCalledWith({ userName: user.userName });
            expect(bcrypt.hashSync).not.toHaveBeenCalled();
            expect(model.create).not.toHaveBeenCalled();
        });
    });

    describe('Login', () => {
        it('should log in an existing user', async () => {
            const existingUser = {
                email: user.email,
                password: bcrypt.hashSync(user.password, 5),
                _id: '64870f92e622309b8eaa38f6',
            };
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTQyYjg0YmEzMzJhZDA4YTM4MDQ1ZCIsImVtYWlsIjoibmF0YUBtYWlsLmNvbSIsImlhdCI6MTY4OTE0NjU0OSwiZXhwIjoxNjg5MTg5NzQ5fQ.hh6Hyef7a7nYoWZUkO7bVxN8ikhBDckREx6uezWxfFU'

            jest.spyOn(model, 'findOne').mockResolvedValueOnce(existingUser);
            jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(true);
            jest.spyOn(tokenService, 'generateAccessToken');
            jest.spyOn(tokenService, 'saveToken');
            const result = await service.login(user);
            expect(result).toEqual({ ...existingUser, token });
            expect(model.findOne).toHaveBeenCalledWith({ email: user.email });
            expect(bcrypt.compareSync).toHaveBeenCalledWith(user.password, existingUser.password);
            expect(tokenService.generateAccessToken).toHaveBeenCalledWith(existingUser._id, existingUser.email);
            expect(tokenService.saveToken).toHaveBeenCalledWith(existingUser._id, token);
        });

        it('should throw an error if the user does not exist', async () => {
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(tokenService, 'generateAccessToken');
            jest.spyOn(tokenService, 'saveToken');
            await expect(service.login(user)).rejects.toThrowError(
                new HttpException('User does not exists', HttpStatus.BAD_REQUEST)
            );
            expect(model.findOne).toHaveBeenCalledWith({ email: user.email });
            expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
            expect(tokenService.saveToken).not.toHaveBeenCalled();
        });

        it('should throw an error if the password is invalid', async () => {
            const existingUser = {
                email: user.email,
                password: bcrypt.hashSync('incorrect-password', 5),
            };
            jest.spyOn(model, 'findOne').mockResolvedValueOnce(existingUser);
            jest.spyOn(tokenService, 'generateAccessToken');
            jest.spyOn(tokenService, 'saveToken');
            jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(false);
            await expect(service.login(user)).rejects.toThrowError(
                new HttpException('Invalid password', HttpStatus.BAD_REQUEST)
            );
            expect(model.findOne).toHaveBeenCalledWith({ email: user.email });
            expect(bcrypt.compareSync).toHaveBeenCalledWith(user.password, existingUser.password);
            expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
            expect(tokenService.saveToken).not.toHaveBeenCalled();
        });
    });

    describe('getUsers', () => {
        it('should return all users', async () => {
            const users = [{
                userName: 'Name',
                email: 'email@mail.com',
                password: 'password',
                _id: '64a7cbc9c8b6a84165a50c8f'
            }];
            jest.spyOn(model, 'find').mockResolvedValueOnce(users);
            const result = await service.getUsers();
            expect(model.find).toHaveBeenCalled();
            expect(result).toEqual(users);
        });
    });

    describe('logout', () => {
        it('should throw an error if auth header is missing', async () => {
            const authHeader = null;
            await expect(service.logout(authHeader)).rejects.toThrowError(HttpException);
            expect(tokenService.removeToken).not.toHaveBeenCalled();
        });

        it('should logout a user', async () => {
            const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTQyY';
            const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTQyY';
            const existingToken = { acknowledged: true, deletedCount: 1 };
            jest.spyOn(tokenService, 'removeToken').mockResolvedValueOnce(existingToken);
            const result = await service.logout(authHeader);
            expect(tokenService.removeToken).toHaveBeenCalledWith(accessToken);
            expect(result).toEqual(existingToken);
        });
    });

});