import * as mongoose from 'mongoose';
import { IsEmail, IsString, Length } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserDto {
    @Field()
    @IsString({ message: 'Email must be a string' })
    @IsEmail({}, { message: 'Please enter valid email' })
    readonly email: string;

    @Field()
    readonly userName?: string;

    @Field()
    @IsString({ message: 'Password must be a string' })
    @Length(6, 10, { message: 'Password must contain between 4 and 10 characters' })
    readonly password: string;

    readonly _id?: mongoose.Types.ObjectId;

    @Field()
    readonly token?: string
}