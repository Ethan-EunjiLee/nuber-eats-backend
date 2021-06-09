import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // * dto에서 설정한 class-validater 사용하기 위해서 필요
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
