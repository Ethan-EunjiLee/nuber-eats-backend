import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';
// * javascript 패키지 import 방식
import * as Joi from 'joi';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
// * typescript 패키지 import 방식
// * import Joi from 'joi';
// * javscript로 작성된 패키지를 typescript 방식으로 import하면 undefined로 나온다.

// console.log('joi: ', Joi);

@Module({
  imports: [
    // * 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true, // * isGlobal: 우리 어플리케이션 어디에서나 config모듈에 접근할 수 있니?
      // * envFilePath: '.env', // * envFilePath: configModule이 읽어야 할 환경변수 위치 설정 -> .env라고만 해도 알아서 읽어온다.
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      /**
       * * cross-env를 이용해 어플리케이션이 실행될 때, dev를 ENV로 넣어주었다!
       * * process.env.NDOE_ENV => 처음 시작할 때 ENV라는 변수가...
       * * === 'dev' ? '.dev.env' : '.test.env' => dev면 dev.env의 환경 변수 사용하고, 아니면 test.env의 환경 변수 사용하자
       *
       * * env파일은 gitignore에 추가해야한다.
       */
      ignoreEnvFile: process.env.NODE_ENV === 'prod' ? true : false, // * ENV가 prod인 경우에는 환경변수 파일 사용 X
      /**
       * * ignoreEnvFile
       * * 서버에 deploy 할 때, 환경변수 파일을 사용하지 않을거니?
       * * script start 부분에 prod 내용 추가 해야 적용된다.
       */
      validationSchema: Joi.object({
        // * valid: NODE_ENV가 valid메소드에 인자로 들어가는 값 중 하나여야 한다.
        // * required(): 필수로 있어야 한다.
        // * required()로 설정된 변수가 존재하지 않을 경우 에러 발생
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
      }),
    }),
    // * typeORM 설정
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST, // * .env 설정 전: host: 'localhost',
      port: +process.env.DB_PORT, // * .env 설정 전: 5432,
      // * .env에서 불러오는 파일은 기본적으로 String이다. => 앞에 +를 붙이면 숫자로 인식
      username: process.env.DB_USERNAME, // * .env 설정 전: 'postgres'
      password: process.env.DB_PASSWORD, // * .env 설정 전: 'postgres', // * localhost의 경우 password 확인 생략된다.(postgres)
      database: process.env.DB_DATABASE, // * .env 설정 전: 'nuber-eats', // * 없는 db에 연결할 경우 에러 발생
      synchronize: process.env.NODE_ENV !== 'prod',
      // * synchonize: TypeORM이 데이터베이스를 연결할 때, 데이터베이스를 현재 동작하는 모듈의 상태로 마이그레이션 할거니?
      // * code에 맞춰서 DB를 매번 migration
      // * 지금 이 코드 해석: prod가 아닌 경우에만 true(synchronize)
      logging: process.env.NODE_ENV !== 'prod',
      // * logging: 데이터베이스에서 무슨 일이 일어나는지 콘솔에 표시할거니?
      entities: [
        //Restaurant => 테스트용
        User,
      ],
    }),
    // * graphQL 설정
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    // RestaurantsModule, => 테스트용
    UsersModule,
    CommonModule,
  ], // == new ApolloServer({기타 설정})
  controllers: [],
  providers: [],
})
export class AppModule {}
