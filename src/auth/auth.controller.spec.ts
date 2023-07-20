import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    const user = {
        name: 'Name',
        email: 'email@mail.com',
        password: 'password'
    };
    const authService = {
        register: jest.fn(dto => ({
            ...dto,
            _id: '64870f92e622309b8eaa38f6'
        })),
        login: jest.fn(dto => ({
            ...dto,
            _id: '64870f92e622309b8eaa38f6',
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTQyYjg0YmEzMzJhZDA4YTM4MDQ1ZCIsImVtYWlsIjoibmF0YUBtYWlsLmNvbSIsImlhdCI6MTY4OTE0NjU0OSwiZXhwIjoxNjg5MTg5NzQ5fQ.hh6Hyef7a7nYoWZUkO7bVxN8ikhBDckREx6uezWxfFU'
        })),
        logout: jest.fn(() => ({
            acknowledged: true,
            deletedCount: 1
        })),
        getUsers: jest.fn(() => ([
            {
                name: 'Name',
                email: 'email@mail.com',
                password: 'password'
            },
            {
                name: 'Name1',
                email: 'email1@mail.com',
                password: 'password1'
            }
        ]))
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService]
        }).overrideProvider(AuthService).useValue(authService).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should register a user', () => {
        expect(controller.register(user)).toEqual({
            _id: expect.any(String),
            name: user.name,
            email: user.email,
            password: user.password
        });
        expect(authService.register).toHaveBeenCalledWith(user);
    });

    it('should login a user', () => {
        expect(controller.login(user)).toEqual({
            _id: expect.any(String),
            name: user.name,
            email: user.email,
            password: user.password,
            token: expect.any(String)
        });
        expect(authService.login).toHaveBeenCalledWith(user);
    });

    it('should logout a user', () => {
        const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTQyYjg0YmEzMzJhZDA4YTM4MDQ1ZCIsImVtYWlsIjoibmF0YUBtYWlsLmNvbSIsImlhdCI6MTY4OTE0NjU0OSwiZXhwIjoxNjg5MTg5NzQ5fQ.hh6Hyef7a7nYoWZUkO7bVxN8ikhBDckREx6uezWxfFU';
        expect(controller.logout({ authorization: authHeader })).toEqual({
            acknowledged: true,
            deletedCount: 1
        });
        expect(authService.logout).toHaveBeenCalledWith(authHeader);
    });

    it('should get all users', () => {
        expect(controller.getUsers()).toEqual([
            {
                name: 'Name',
                email: 'email@mail.com',
                password: 'password'
            },
            {
                name: 'Name1',
                email: 'email1@mail.com',
                password: 'password1'
            }
        ]);
        expect(authService.getUsers).toHaveBeenCalled();
    });

});