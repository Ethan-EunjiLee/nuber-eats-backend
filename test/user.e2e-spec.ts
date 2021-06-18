import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'nico@las.com',
  password: '12345',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  // * 로그인 성공 후 나오는 token값 받아오기
  let jwtToken: string;
  // * userProfile에서 사용할 user id를 가져오기 위한 변수
  // * 물론 매번 db를 갈아엎기 때문에 id=1 을 이용해 .userProfile을 사용해도 된다.
  let usersRepository: Repository<User>;

  // * beforeAll: 모든 test전에 module을 load
  // * 앱을 생성하고 다 import하고, typeorm을 이용하고 등등...
  beforeAll(async () => {
    // * UserModule만 테스트하더라도 AppModule을 통으로 import 해야 한다.
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    // * 찐 User Repository의 토큰을 받아와 테스트용 usersRepository 구현
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  // * 모든 테스트가 끝날 때 마다 application이 종료 & database drop
  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      // * DB 들어가서 계속 새로고침 하다보면 table 생겼다가 DB가 비워지는것을 확인할 수 있다.
      return (
        request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `mutation {
                    createAccount(input:{
                      email:"${testUser.email}",
                      password:"${testUser.password}",
                      role: Owner
                    }){
                      error, ok
                    }
                  }`,
          })
          /**
           * * ==> 즉, response 바로 테스트 가능
           */
          .expect(200)
          .expect((res) => {
            expect(res.body.data.createAccount.ok).toBe(true);
            expect(res.body.data.createAccount.error).toBe(null);
          })
      );
    });

    // * 이미 존재하는 계정에 대한 테스트기 때문에 true인 경우 먼저 테스트하고 진행해야 한다.
    it('should fail if account already exists', () => {
      return (
        request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `mutation {
                    createAccount(input:{
                      email:"${testUser.email}",
                      password:"${testUser.password}",
                      role: Owner
                    }){
                      error, ok
                    }
                  }`,
          })
          /**
           * * ==> 즉, response 바로 테스트 가능
           */
          .expect(200)
          .expect((res) => {
            expect(res.body.data.createAccount.ok).toBe(false);
            expect(res.body.data.createAccount.error).toEqual(
              expect.any(String),
            );
          })
      );
    });
  });
  describe('login', () => {
    // * 토큰을 받아와야 한다~
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
                    login(input:{
                      email:"${testUser.email}",
                      password:"${testUser.password}",
                    }) {
                      error
                      ok
                      token
                    }
                  }`,
        })
        .expect(200)
        .expect((res) => {
          // * res의 body 속성 중 data 속성 중 login 속성만 가져다 const 타입으로 저장
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token; // * 다른 테스트에서도 사용하기 위해 토큰 외부에 저장
        });
    });
    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
                    login(input:{
                      email:"${testUser.email}",
                      password:"wrongpassword",
                    }) {
                      error
                      ok
                      token
                    }
                  }`,
        })
        .expect(200)
        .expect((res) => {
          console.log(res);
          // * res의 body 속성 중 data 속성 중 login 속성만 가져다 const 타입으로 저장
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toEqual(expect.any(String));
          expect(login.token).toBe(null);
        });
    });
  });
  describe('userProfile', () => {
    // * beforeAll을 통해 새로운 값이 저장되고,
    // * 이 값을 it 내부에서 사용하기 위해 외부에 저장되어야 한다.
    let userId: number;
    beforeAll(async () => {
      // * 배열 비구조화
      // * 배열 중 user의 값을 가져와서 바로 변수로 저장
      // * (여러 user가 출력되는게 원래는 맞지만, 여기서는 계속 db 새로 갈아끼우기 때문에 1개의  user만 return 된다.
      const [user] = await usersRepository.find();
      userId = user.id;
    });
    it("should find a user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken) // * set위치는 반드시 post뒤에! superTest의 header를 seting하는 방법
        .send({
          query: `
                  {
                    userProfile(userId: ${userId}){
                        error, ok, user{
                          id
                        }
                      } 
                    }
                  `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(id).toBe(userId);
        });
    });
    it('should not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken) // * set위치는 반드시 post뒤에! superTest의 header를 seting하는 방법
        .send({
          query: `
                  {
                    userProfile(userId: 666){
                        error, ok, user{
                          id
                        }
                      } 
                    }
                  `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('User not found');
          expect(user).toBe(null);
        });
    });
  });
  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
                  {
                    me  {
                       email
                    } 
                  }     
                 `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          console.log('res.body: ', res.body);
          expect(email).toBe(testUser.email);
        });
    });
    it('should not allow logged out user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
                  {
                    me  {
                       email
                    } 
                  }     
                 `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          console.log(errors);
          // * 배열 비구조화 할당(구조분해) 문법 => errors 배열의 첫번째 객체의 이름을 error로 지정
          const [error, error2] = errors;
          console.log('error: ', error);
          console.log('error2: ', error2);
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
  it.todo('verifyEmail');
  it.todo('editProfile');
});
