import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../auth/auth.model';

export type TokenData = HydratedDocument<Token>;

@Schema()
export class Token {
    @Prop({ type: String, required: true, unique: true })
    token: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;
}

export const TokenSchema = SchemaFactory.createForClass(Token);