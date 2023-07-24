import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { TokenModule } from './token/token.module';
import { AuthMiddleware } from './shared/middleware/auth-middleware';
import { ChatModule } from './chat/chat.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env'
        }),
        MongooseModule.forRoot(process.env.DB_URL),
        AuthModule,
        ProductsModule,
        TokenModule,
        ChatModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
            include: [AuthModule, ProductsModule],
            driver: ApolloDriver,
            autoSchemaFile: true
        })
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(
            { path: 'products', method: RequestMethod.ALL },
            { path: 'products/:id', method: RequestMethod.ALL },
            { path: 'auth/users', method: RequestMethod.GET }
        )
    }
}
