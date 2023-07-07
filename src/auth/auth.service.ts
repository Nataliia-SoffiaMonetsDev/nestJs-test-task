import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './auth.model';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/token/token.service';
import { UserDto } from './dto/user.dto';
import { LogoutResponse } from 'src/shared/interfaces/response.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private tokenService: TokenService
    ) { }

    async register(user: UserDto): Promise<UserDto> {
        const { email, password, userName } = user;
        const existingUser = await this.userModel.findOne({ email });
        const isNameUnique = await this.userModel.findOne({ userName });
        if (existingUser) {
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
        }
        if (isNameUnique) {
            throw new HttpException('User name should be unique', HttpStatus.BAD_REQUEST);
        }
        const hashPassword = bcrypt.hashSync(password, 5);
        const userData = new this.userModel({ email, password: hashPassword, userName });
        await userData.save();
        return userData;
    }

    async login(user: UserDto): Promise<UserDto> {
        const { email, password } = user;
        const existingUser = await this.userModel.findOne({ email });
        if (!existingUser) {
            throw new HttpException('User does not exists', HttpStatus.BAD_REQUEST);
        }
        const validPassword = bcrypt.compareSync(password, existingUser.password);
        if (!validPassword) {
            throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
        }
        const token = this.tokenService.generateAccessToken(existingUser._id, existingUser.email);
        await this.tokenService.saveToken(existingUser._id, token);
        existingUser.token = token;
        return existingUser;
    }

    async getUsers(): Promise<UserDto[]> {
        const users = await this.userModel.find();
        return users;
    }

    async logout(authHeader: string): Promise<LogoutResponse> {
        if (!authHeader) {
            throw new HttpException('User unauthorized', HttpStatus.UNAUTHORIZED);
        }
        const accessToken = authHeader.split(' ')[1];
        if (!accessToken) {
            throw new HttpException('User unauthorized', HttpStatus.UNAUTHORIZED);
        }
        const exsistingToken = await this.tokenService.removeToken(accessToken);
        return exsistingToken;
    }
}
