import * as mongoose from 'mongoose';
import { IsString } from 'class-validator';

export class ChatDto {
    @IsString({ message: 'Message must be a string' })
    readonly message: string;

    @IsString({ message: 'User name must be a string' })
    readonly userName: string;

    @IsString({ message: 'Date must be a string' })
    readonly date: string;

    readonly _id?: mongoose.Types.ObjectId;
}