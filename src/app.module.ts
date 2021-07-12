import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
// * javascript 패키지 import 방식
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { RestaurantsModule } from './restaurant/restaurant.module';
import { Restaurant } from './restaurant/entities/restaurant.entity';
import { Category } from './restaurant/entities/category.entity';
import { Dish } from './restaurant/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entity/order.entity';
import { OrderItem } from './orders/entity/order-item.entity';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';
// * typescript 패키지 import 방식
// * import Joi from 'joi';
// * javscript로 작성된 패키지를 typescript 방식으로 import하면 undefined로 나온다.

// console.log('joi: ', Joi);

@Module({
  imports: [
    // * 환경변수 설정 => import 제일 먼저
    ConfigModule.forRoot({
      isGlobal: true, // * isGlobal: 우리 어플리케이션 어디에서나 config모듈에 접근할 수 있니? -> true인 경우 다른 하위 모듈에서 해당 Service를 사용할 때 import해줄 필요 없다.
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
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
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
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      // * logging: 데이터베이스에서 무슨 일이 일어나는지 콘솔에 표시할거니?
      entities: [
        //Restaurant => 테스트용
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
    }),
    // * graphQL 설정
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true, // * subscription 구현을 위해 websocket 활성화
      autoSchemaFile: true,
      // * appolo server의 context를 function으로 정의하면 매 request마다 호출된다.
      // * 여기서 return 되는 애들은 모든 resolver에서 공유해서 사용 가능
      // * req안에는 이미 user라는 값이 있다. 우리는 이걸 resolver에서 사용하기 위해 context를 통해 공유하는 것
      // * context내부에는 이미 req가 들어있다.
      // * 원래는 req 개체에서 http 헤더 및 기타 요청 메타데이터를 추출하지만, subscription인 경우 connection에서 메타데이터 추출
      // * https://www.apollographql.com/docs/apollo-server/data/subscriptions/#operation-context
      context: ({ req, connection }) => {
        // * websocket 사용을 위해 connection을 넣어준다.
        // * websocket에는 request가 없기 때문에 subscription 사용할 때 에러 발생
        // * http - request //// websocket - connection
        // * canActivate에서 ExecutionContext를 통해 해당 값들 확인 가능
        const TOKEN_KEY = 'x-jwt';

        // * http 통신을 하는 경우 vs 웹소켓 통신을 하는 경우
        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY],
        };
      },
    }),

    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      emailDomain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    ScheduleModule.forRoot(),

    AuthModule, // * APP_GUARD 설정되어 있음
    // RestaurantsModule, => 테스트용
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
    PaymentsModule,
  ], // == new ApolloServer({기타 설정})
  controllers: [],
  providers: [],
})

/**
 * * request 처리 순서: middleware -> guard -> interceptor -> pipe
 * * Middleware: 여기에서 req에 user를 넣어준다.
 * * GraphQLContext: GraphQL의 Context는 매 request마다 호출된다. 여기에서 req의 user를 context에 넣어준다.
 * * Guard: 만들어둔 AuthGuard를 통해 request가 통과되고 여기에서 role에 따라 다음 단계 진행
 * * 이 후 만들어둔 @AuthUser() 데코레이터를 통해 user 객체만 남아 넘어가고 처리후 return 된다.
 * *
 */

// * JwtMiddleware로는 subscription의 토큰을 처리할 수 없다.
export class AppModule {}

// * 함수형 Middleware의 경우 main.ts에서도 구현 가능
/*
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // * MiddlewareConfigProxy.forRoutes([정확히 어떤 routes에 지정할지 설정])
    // * forRoute는 없어도 상관은 없음. 추가 설정이 하고 싶으면 작성
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql', // * 모든 url에서 원할 경우 '*' 지정
      method: RequestMethod.POST, // * 모든 Method에서 원할 경우 RequestMethod.all로 지정
    });
    // * .exclude({
    //   * 배제할 라우터 정의
    // *  path: '/api',
    // *  method: RequestMethod.ALL,
    // * });
  }
}
*/
