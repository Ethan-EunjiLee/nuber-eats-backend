import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  // ! 계정 만들기
  // * es6는 객체의 각 값을 바로 변수로 빼서 가져올 수 있다.
  // * 에러가 발생하는 경우 관련 문구를 string으로 boolean false를 배열로 리턴, 에러 없으면 boolean true만 배열로 리턴
  // * 여기서는 배열로 return 했지만, Object로 하고 싶으면 그렇게 해도 된다 ㅇㅅㅇ
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    // *false인 경우 회원가입 X인 경우
    // * 1. check new user
    try {
      // * email을 이용해 기존 회원 여부 체크
      // * => Undefined가 아닌 경우 가입된 이메일이라는 것을 의미
      const exists = await this.users.findOne({ email });
      if (exists) {
        // * make and return error -> 이미 계정이 있으니까
        // * => thorw Error(): 이런 방식도 당연 가능
        return { ok: false, error: 'There is a user with that eamil already' }; // * 함수 탈출
      }
      // * 2. create user (TODO: not yet: & hash password)
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (err) {
      // * make and return error
      return { ok: false, error: "Couldn't create account" };
    }
  }
}
