import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createValidationPipe } from './shared/pipes/validation.pipe';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createServer } from 'http';

class SocketIoAdapter extends IoAdapter {
    createIOServer(port: number, options?: any): any {
      const server = createServer();
      return super.createIOServer(port, { ...options, server });
    }
}

async function start() {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: 'http://products-list-with-chat.s3-website.eu-north-1.amazonaws.com',
        credentials: true,
    });
    app.useGlobalPipes(createValidationPipe());
    app.useWebSocketAdapter(new SocketIoAdapter(app));
    await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
start();