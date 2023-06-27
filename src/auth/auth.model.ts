import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserData = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ type: String, required: true, unique: true })
    email: string;

    @Prop({ type: String, required: true })
    password: string;

    @Prop({ type: String })
    token: string
}

export const UserSchema = SchemaFactory.createForClass(User);