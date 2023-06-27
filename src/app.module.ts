import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { TokenModule } from './token/token.module';
import { AuthMiddleware } from './shared/middleware/auth-middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
        envFilePath: '.env'
    }),
    MongooseModule.forRoot(process.env.DB_URL),
    AuthModule,
    ProductsModule,
    TokenModule
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
