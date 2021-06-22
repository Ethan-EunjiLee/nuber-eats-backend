import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // * dto에서 설정한 class-validater 사용하기 위해서 필요
  app.useGlobalPipes(new ValidationPipe());

  // * package.json 수정해서 env 읽어오기 완료
  // console.log('main.ts: ', process.env.DB_HOST);

  // * 미들웨어 등록 > 함수형만 사용 가능
  // app.use(JwtMiddleware);

  await app.listen(5000);
}
bootstrap();
