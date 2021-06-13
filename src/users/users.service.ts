import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    /**
     * * 환경변수 사용하기(ConfigModule을 사용해서)
     *
     * * 1. 환경변수를 사용할 모듈의 imports 배열에 ConfigService 추가
     * * 2. ConfigService를 주입
     * * 3. 주입한 ConfigService의 get("환경변수명") 메소드를 이용해 환경변수를 불러온다.
     */
    //private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    // 테스트
    //console.log('SECRET_KEY: ', this.config.get('SECRET_KEY'));
  }

  // ! 계정 만들기
  // * es6는 객체의 각 값을 바로 변수로 빼서 가져올 수 있다.
  // * 에러가 발생하는 경우 관련 문구를 string으로 boolean false를 배열로 리턴, 에러 없으면 boolean true만 배열로 리턴
  // * 여기서는 배열로 return 했지만, Object로 하고 싶으면 그렇게 해도 된다 ㅇㅅㅇ
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
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
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );

      // * TODO: 유저가 입력한 이메일 확인(verification)
      // * user가 들어가는 verification entity를 만든(create) 후 db에 저장(save)
      // * 현재는 임의의 코드가 verification에 저장만 되고 있음
      await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );

      return { ok: true };
    } catch (err) {
      // * make and return error
      return { ok: false, error: "Couldn't create account" };
    }
  }

  // ! 로그인
  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    // * 1. find the user with the email
    // * 2. check if the password is correct
    // * 3. make a JWT and give it to the user

    // ! 1. find the user with the email
    try {
      // * hash 중복때문에 entity에서 password의 select 속성을 false로 지정해줬기 때문에,
      // * 필요할 때 마다 select option을 설정해줘야한다.
      const user = await this.users.findOne(
        { email },
        { select: ['password', 'id'] }, // * select : fase인 password를 선택하기 위해 id도 select 처리
      ); // * DB에서 email이 입력받은 email인 경우 출력
      console.log('test: user: ', user);
      if (!user) {
        // * 이메일이 일치하는 유저가 없는 경우
        return {
          ok: false,
          error: 'User not found',
        };
      }

      // ! 2. check if the password is correct
      // * user 객체는 user.entity 인스턴스로 checkPassword method를 가지고 있다.
      // * 입력받은 aPassword와 이메일 일치해서 만든 User 객체의 password를 비교
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      // ! 3. make a JWT and give it to the user
      // * id는 coreEntity에 선언되어 있다.
      const token = this.jwtService.sign(user.id);
      console.log('id:', user.id);
      // * 비밀번호 일치하는 경우
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({ id });
      if (!user) {
        throw Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        error: 'User not found',
        ok: false,
      };
    }

    //return this.users.findOne({ id });
  }

  /**
   * ! Profile 수정
   *
   * * 우리는 login한 경우가 아니면 userService에서 editProfile에 접근할 수 없게 구현했기 때문에, 여기서 db에 있는지 여부는 체크할 필요 없음
   * * token에서 넘어온 userId를 이용해 update 진행
   */
  /**
   * * [구]
   * * async editProfile(userId: number, { email, password }: EditProfileInput) {
   * * --> email, password 중 한 항목이라도 입력하지 않으면 에러 발생
   *
   * * [신]
   * * 그냥 객체를 통으로 받아준 후 spread 연산자를 이용해 있는 값들만 typeORM을 이용해 db에 넣자
   */
  async editProfile(
    userId: number,
    editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    /**
     * * [repository.update()]
     * * - Entity를 부분적으로 udpate
     * * - entity가 db에 있는지 확인하지 않는다.
     * * - 데이터의 존재 여부를 확인하지 않기 때문에 가장 빠른 Udpate Query다
     * * - [사용 방법]
     * * - update({criteria}, {바꿀 항목들})
     */

    // TODO: 업데이트하면 비밀번호 해시 풀린다... 이유) insert에는 hash가 걸려있지만, update에는 안걸려있다.
    // * spread 연산자를 이용해 객체에 정의된 값들만 typeORM으로 넣어준다.
    // * 아래와 동일, 단, @BeforeUpdate() 데코레이터 적용을 위해 save()로 변경
    // * return this.users.update();
    // * 동일: this.users.update({id: userId}, { email, password });

    // * js로 entity를 직접 update

    try {
      const { email, password } = editProfileInput;
      const user = await this.users.findOne(userId);

      if (email) {
        user.email = email;
        user.verified = false; // * email이 변경되면 다시 verification 받아야 한다.
        await this.verifications.save(
          this.verifications.create({
            user,
          }),
        );
      }
      if (password) {
        user.password = password; // * password값이 있는 경우 hash 진행
      }

      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not update profile',
      };
    }
  }

  // ! 이메일 확인
  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      // ! 1. verification 찾기
      const verification = await this.verifications.findOne(
        { code: code },
        { relations: ['user'] }, // * 일대일관계 테이블의 entity 통으로
        // { loadRelationId: true }, // * 아이디만
      );

      // ! 2. 존재한다면, 그걸 삭제하고 연결된 user의 verified 칼럼을 true로 변경
      if (verification) {
        // * code값이 일치하는 verification이 있는 경우 -> verify true로 변경 후 저장 업데이트
        verification.user.verified = true;
        await this.users.save(verification.user);
        // * verification을 통해 users에 접근
        // * this.users는 생성자에서 주입한 UserRepository고 여기에 save 메소드를 이용해 verification.user를 저장

        // * 이메일 확인 후 verification 지워야 한다.
        await this.verifications.delete(verification.id);

        return { ok: true };
      }
      return {
        ok: false,
        error: 'Verification not found',
      };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
