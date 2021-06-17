import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  // * beforeAll: 모든 test전에 module을 load
  // * 앱을 생성하고 다 import하고, typeorm을 이용하고 등등...
  beforeAll(async () => {
    // * UserModule만 테스트하더라도 AppModule을 통으로 import 해야 한다.
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  // * 모든 테스트가 끝날 때 마다 application이 종료 & database drop
  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  it.todo('createAccount');
  it.todo('userProfile');
  it.todo('login');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');
});
