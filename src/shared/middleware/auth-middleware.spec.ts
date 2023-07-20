import { Test } from '@nestjs/testing';
import { AuthMiddleware } from './auth-middleware';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from 'src/token/token.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthMiddleware', () => {
    let authMiddleware: AuthMiddleware;

    const user = {
        userName: 'Name',
        email: 'email@mail.com',
        password: 'password',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTQyYjg0YmEzMzJhZDA4YTM4MDQ1ZCIsImVtYWlsIjoibmF0YUBtYWlsLmNvbSIsImlhdCI6MTY4OTE0NjU0OSwiZXhwIjoxNjg5MTg5NzQ5fQ.hh6Hyef7a7nYoWZUkO7bVxN8ikhBDckREx6uezWxfFU'
    };

    const tokenService = {
        validateAccessToken: jest.fn()
    };

    const res = {} as Response;

    const next = jest.fn() as NextFunction;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [AuthMiddleware, TokenService],
        }).overrideProvider(TokenService).useValue(tokenService).compile();

        authMiddleware = moduleRef.get<AuthMiddleware>(AuthMiddleware);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(authMiddleware).toBeDefined();
    });

    it('should pass authentication and set user data on request', async () => {
        const req = {
            headers: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0YTQyYjg0YmEzMzJhZDA4YTM4MDQ1ZCIsImVtYWlsIjoibmF0YUBtYWlsLmNvbSIsImlhdCI6MTY4OTE0NjU0OSwiZXhwIjoxNjg5MTg5NzQ5fQ.hh6Hyef7a7nYoWZUkO7bVxN8ikhBDckREx6uezWxfFU' }
        } as Request;

        const accessToken = req.headers.authorization.split(' ')[1];

        jest.spyOn(tokenService, 'validateAccessToken').mockImplementation(() => user);

        await authMiddleware.use(req, res, next);

        expect(tokenService.validateAccessToken).toHaveBeenCalledWith(accessToken);
        expect(next).toHaveBeenCalled();
    });

    it('should throw HttpException when access token is not provided', async () => {
        const req = {
            headers: {},
        } as Request;

        try {
            await authMiddleware.use(req, res, next);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.message).toEqual('User unauthorized');
            expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
            expect(next).toHaveBeenCalledWith(error);
        }
    });

    it('should throw HttpException with UNAUTHORIZED status when access token is invalid', async () => {
        const req = {
            headers: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZC' },
        } as Request;

        const accessToken = req.headers.authorization.split(' ')[1];

        jest.spyOn(tokenService, 'validateAccessToken').mockImplementation(() => null);

        try {
            await authMiddleware.use(req, res, next);
            expect(tokenService.validateAccessToken).toBeCalledWith(accessToken);
        } catch (error) {
            expect(error).toBeInstanceOf(HttpException);
            expect(error.message).toEqual('User unauthorized');
            expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
            expect(next).not.toHaveBeenCalledWith(error);
        }
    });

});