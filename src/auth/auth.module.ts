import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './auth.model';
import { TokenModule } from 'src/token/token.module';

@Module({
    imports: [ 
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        TokenModule
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule { }
