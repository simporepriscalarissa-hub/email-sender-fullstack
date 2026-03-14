import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3001);
  console.log(' Email Sender API running on http://localhost:3001');
}
bootstrap();
