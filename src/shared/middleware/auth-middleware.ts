import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { TokenService } from "src/token/token.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    constructor(private tokenService: TokenService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                throw new HttpException('User unauthorized', HttpStatus.UNAUTHORIZED);
            }

            const accessToken = authHeader.split(' ')[1];
            if (!accessToken) {
                throw new HttpException('User unauthorized', HttpStatus.UNAUTHORIZED);
            }

            const userData = await this.tokenService.validateAccessToken(accessToken);
            if (!userData) {
                throw new HttpException('User unauthorized', HttpStatus.UNAUTHORIZED);
            }
            req['user'] = userData;

            next();
        } catch (e) {
            next(e);
        }
    }

}