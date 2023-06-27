import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from './token.model';
import * as mongoose from 'mongoose'

@Injectable()
export class TokenService {

    constructor(
        @InjectModel(Token.name) private tokenModel: Model<Token>,
        private jwtService: JwtService
    ) { }

    generateAccessToken(id: mongoose.Types.ObjectId, email: string) {
        const payload = {
            id,
            email
        };
        return this.jwtService.sign(payload);
    }

    async saveToken(id: mongoose.Types.ObjectId, token: string) {
        const existingToken = await this.tokenModel.findOne({ user: id });
        if (existingToken) {
            existingToken.token = token;
            return existingToken.save();
        }
        const savedToken = await this.tokenModel.create({user: id, token});
        return savedToken;
    }

    async removeToken(token: string) {
        const tokenData = await this.tokenModel.deleteOne({token});
        return tokenData;
    }

    async validateAccessToken(token: string) {
        try {
            const userData = this.jwtService.verify(token);
            return userData;
        } catch (e) {
            return null;
        }
    }

    async findToken(token: string) {
        const tokenData = await this.tokenModel.findOne({token});
        return tokenData;
    }
}
