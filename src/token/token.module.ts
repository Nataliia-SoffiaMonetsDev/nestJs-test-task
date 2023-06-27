import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './token.model';

@Module({
  providers: [TokenService],
  exports: [TokenService],
  imports: [
    JwtModule.register({
        secret: 'SECRET_KEY',
        signOptions: {
            expiresIn: '12h'
        }
    }),
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }])
  ]
})
export class TokenModule {}
