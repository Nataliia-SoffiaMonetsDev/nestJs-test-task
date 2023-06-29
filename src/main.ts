import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createValidationPipe } from './shared/pipes/validation.pipe';

async function start() {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: 'http://products-list-task.s3-website.eu-central-1.amazonaws.com',
        credentials: true,
    });
    app.useGlobalPipes(createValidationPipe());
    await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
start();