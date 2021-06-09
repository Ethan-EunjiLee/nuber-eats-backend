import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // * dto에서 설정한 class-validater 사용하기 위해서 필요
  app.useGlobalPipes(new ValidationPipe());

  // ! env 설정이 안된다!! 왜 안되냐!!!
  console.log(process.env.DB_HOST);

  await app.listen(3000);
}
bootstrap();
