import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { getRepository, Repository } from 'typeorm';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

// * jest.fn(): 가짜 함수를 만든다.
// * test에서 실행되는 함수들은 모두 jest.fn()을 이용해 정의되어 있어야 mockedResolved와 같은 함수를 이용해 return 값을 정의해줄 수 있다.
// * test에서 사용되는 Repository, service들을 함수 형태로 만들어 호출할 때 마다 새로운 값을 사용할 수 있도록 처리(Test Module 설정할 때 함수로 호출)
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

/**
 * * es6
 * * () => { return { a: 1 }; }
 * * () => ({ a: 1 })  // 위 표현과 동일하다. 객체 반환시 소괄호를 사용한다.
 * * https://poiemaweb.com/es6-arrow-function
 */

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  //   sendEmail: jest.fn(), // * private 함수는 안끌어와도 된다.
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// * describe: 우리는 어떤 클래스를 테스트 할거야~
// * it: 테스트 진행(===test())
// * it.todo: 어떤 테스트할지 요약 설명 (===test.todo())

describe('UserService', () => {
  // * 모듈 외부에서도 service를 사용하기 위해 service 변수는 모듈 외부에 생성
  let service: UsersService;
  // * Partial<T>: 타입 T의 모든 요소를 optional하게 만든다.
  // * Record<K extends string | number | sympol, T>: T의 요소를 K의 집합으로 타입을 만들어주는 TypeScript
  // * let userRepository: Partial<Record<'hello', number>>; => typeof userRepository.hello === number
  /**
   * * Partial<Record<keyof Repository<User>, jest.Mock>>;
   * * Record<keyof Repository<User>, jest.Mock
   * * ::: jest.Mock의 요소들을 이용해 Repository의 key값(save(), findOne(), 기타 등등) 타입을 만들어준다.
   */

  let userRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  /**
   * * 모든 테스트를 하기전에 실행될 테스트 모듈
   *
   * * beforeAll => beforeEach로 변경
   * * :: beforeAll의 경우 테스트 하기 전 1회만 실행되기 때문에,
   * *   이전 테스트의 mock 작업이 남아있어 다음 테스트에서 정확한 테스트가 어렵다.
   * *   매 테스트마다 새로운 mock으로 작업을 하려면 beforeEach로 매번 모듈을 새로 불러와야 한다.
   */
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        // * 실제 테스트 할 서비스를 제외하고는 모두 Mock으로 등록
        UsersService,
        {
          provide: getRepositoryToken(User), // * Entity의 Repository token 제공
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification), // * Entity의 Repository token 제공
          useValue: mockRepository(),
        },
        {
          provide: JwtService, // * Entity의 Repository token 제공
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    // * 테스팅 모듈의 get(): Repository의 token 또는 Service 타입을 넣어서 짭 객체 생성
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User)); // * Mock Type 설정 등을 통해 가짜 UserRepository 할당
    verificationRepository = module.get(getRepositoryToken(Verification)); // * Mock Type 설정 등을 통해 가짜 VerificationRepository 할당
  });

  // * UserService가 정의되어 있니? 제대로 불러졌니?
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // * 해당 클래스에서 테스트할 method 지정
  it.todo('createAccount');
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');

  describe('createAccount', () => {
    // * 공통으로 사용되는 변수
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };

    // const createVerificationArgs = {
    //   code: '',
    //   user: createAccountArgs,
    // };

    // * user가 존재하지 않으면 실패해야 한다.
    it('should fail if user exist', async () => {
      /**
       * * userRepository.findOne.mockResolvedValue
       * * Repository.findOne(): Promise<Entity>
       * * ==> mock 함수에서도 Promise를 리턴하기 위해 mockResolvedValue() method 사용
       * * ==> mock이 findOne을 가로채고 멋대로 반환값 속여서 return
       *
       * * service.createAccount
       * * ==> 내부에서 실행되는 findOne을 잡아 mock 함수가 return 값을 준다.
       * * ==> return값이 있으면 원래 식은 {ok, error}를 리턴한다.
       * * ==> 진짜로 리턴되었기 때문에 expect(result).toMatchObject()가 true로 나오면서 test 통과
       */
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'lalalal',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that eamil already',
      });
    });
    // * db에 일치하는 user가 없다고 쳤을 때, 새로운 user를 생성하는지?
    it('should create a new user', async () => {
      // * 우리의 코드를 test 통과시키고 싶으면 모든걸 mock 해야한다.
      userRepository.findOne.mockResolvedValue(undefined); // Promise
      userRepository.create.mockReturnValue(createAccountArgs); // 단순 값
      userRepository.save.mockResolvedValue(createAccountArgs); // Promise
      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepository.save.mockResolvedValue({ code: 'code' }); // * mailService Unit test에서 사용

      const result = await service.createAccount(createAccountArgs);
      /**
       * * toHaveBeenCalledTimes(1): userRepository.create 함수가 한 번 불리니?
       * * [expect(userRepository.create).toHaveBeenCalledTimes(1);] => 2번 호출됐다는 에러 발생
       * * ==> userRepository, verificationRepository 모두 같은 mockRepository로 되어있기 때문에,
       * *     userRepository.create()와 verificationRepository.create()를 같은 거로 처리해서 총 2번 호출된다고 나온다.
       * * ==> mockRepository를 다르게 인식할 수 있도록 위에서 코드 변경 필요
       * *    기존 mockRepository를 mockRepository를 return 하는 함수로 변경 후 해당 함수를 각각 provide에 적용
       */
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      /**
       * * toHaveBeenCalledWith(): 어떤 인자로 create가 호출되니?
       */
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);
      /**
       * * save() 1번 부르니? 부를 때 createAccountArgs를 파라미터로 써서 하니?
       */
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);
      /**
       * * verificationRepository.create() 1번 부르니?
       * * 부를 때 user객체 쓰니?
       */
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      /**
       * * mailService test
       * * 1번 호출하니? string 타입 파라미터 2개로 들어오니?
       */
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      // * 최종 리턴값 확인
      expect(result).toEqual({ ok: true });
    });

    // * 어떤 exception이라도 발생한다면, fail 시켜야한다.
    it('should fail if there is an exception', async () => {
      // * mockRejectedValue() === Promise.reject(reason: Promise 거부한 이유)
      userRepository.findOne.mockRejectedValue(new Error());

      // * service에서 사용되는 findone이 error 뱉어내기 때문에 createAccount() 실행 시 에러 발생
      const result = await service.createAccount(createAccountArgs);
      console.log(
        '🚀 ~ file: users.service.spec.ts ~ line 190 ~ it ~ result',
        result,
      );
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'bs@email',
      password: 'bs.password',
    };

    it('should fail if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

      /**
       * * findOne은 1번만 호출하니?
       * * findOne 호출할 때, Object 타입 2개 호출해서 작업하니?
       * * user가 없을 때, 리턴이 어떻게 되니?
       */
      // * createAccount() 테스트 할 때 findOne()을 3번 호출했기 때문에 1번이 아니라 총 4번 호출로 계산한다.
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)), // * mockResolvedValue 역할 수행
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      console.log(
        '🚀 ~ file: users.service.spec.ts ~ line 240 ~ it ~ result',
        result,
      );

      expect(result).toEqual({
        ok: false,
        error: 'Wrong password',
      });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)), // * mockResolvedValue 역할 수행
      };
      const mockedToken = 'mockedToken';
      userRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);
      console.log(
        '🚀 ~ file: users.service.spec.ts ~ line 262 ~ it ~ result',
        result,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
    });
    it('should fail if there is an exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      console.log(
        '🚀 ~ file: users.service.spec.ts ~ line 273 ~ it ~ result',
        result,
      );
      expect(result).toEqual({
        ok: false,
        error: new Error(),
      });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };

    it('should find an existing user', async () => {
      userRepository.findOneOrFail.mockResolvedValue(findByIdArgs); // * {id:1} ==> user
      const result = await service.findById(1);
      console.log(
        '🚀 ~ file: users.service.spec.ts ~ line 288 ~ it ~ result',
        result,
      );

      expect(result).toEqual({
        ok: true,
        user: findByIdArgs,
      });
    });

    it('should fail if no user is found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error()); // * {id:1} ==> user
      const result = await service.findById(1); // * 틀린 경우 봐야하기 때문에 다른 값 입력
      console.log(
        '🚀 ~ file: users.service.spec.ts ~ line 308 ~ it ~ result',
        result,
      );
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = { email: 'mockOldEmail', verified: true };
      const editProfileArgs = {
        input: { email: 'mockNewEmail' },
        userid: 1,
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      userRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.delete.mockResolvedValue({ raw: 1, affected: 1 });
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userid, editProfileArgs.input);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userid,
      );
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        input: { password: 'mockNewPassword' },
        userid: 1,
      };
      userRepository.findOne.mockResolvedValue({ password: 'mockOldPassword' });

      await service.editProfile(editProfileArgs.userid, editProfileArgs.input);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
    });
  });
});
