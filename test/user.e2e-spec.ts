import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  // * beforeAll: 모든 test전에 module을 load
  beforeAll(async () => {
    // * UserModule만 테스트하더라도 AppModule을 통으로 import 해야 한다.
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it.todo('me');
  it.todo('userProfile');
  it.todo('createAccount');
  it.todo('login');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
