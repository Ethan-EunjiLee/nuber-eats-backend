import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    // * 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true, // * isGlobal: 우리 어플리케이션 어디에서나 config모듈에 접근할 수 있니?
      // * envFilePath: '.env', // * envFilePath: configModule이 읽어야 할 환경변수 위치 설정 -> .env라고만 해도 알아서 읽어온다.
      envFilePath: process.env.NODE_ENV === 'dev' ? 'env.dev.' : '.env.test',
      /**
       * * cross-env를 이용해 어플리케이션이 실행될 때, dev를 ENV로 넣어주었다!
       * * process.env.NDOE_ENV => 처음 시작할 때 ENV라는 변수가...
       * * === 'dev' ? '.dev.env' : '.test.env' => dev면 dev.env의 환경 변수 사용하고, 아니면 test.env의 환경 변수 사용하자
       *
       * * env파일은 gitignore에 추가해야한다.
       */
    }),
    // * typeORM 설정
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres', // * localhost의 경우 password 확인 생략된다.(postgres)
      database: 'nuber-eats', // * 없는 db에 연결할 경우 에러 발생
      synchronize: true,
      // * synchonize: TypeORM이 데이터베이스를 연결할 때, 데이터베이스를 현재 동작하는 모듈의 상태로 마이그레이션 할거니?
      logging: true,
      // * logging: 데이터베이스에서 무슨 일이 일어나는지 콘솔에 표시할거니?
    }),
    // * graphQL 설정
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    RestaurantsModule,
  ], // == new ApolloServer({기타 설정})
  controllers: [],
  providers: [],
})
export class AppModule {}
