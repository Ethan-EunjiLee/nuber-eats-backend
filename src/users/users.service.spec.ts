import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { getRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

// * jest.fn(): 가짜 함수를 만든다.
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  //   sendEmail: jest.fn(), // * private 함수는 안끌어와도 된다.
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// * 우리는 어떤 클래스를 테스트 할거야~
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

  // * 모든 테스트를 하기전에 실행될 테스트 모듈
  beforeAll(async () => {
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
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    // * 테스팅 모듈의 get(): Repository의 token 또는 Service 타입을 넣어서 짭 객체 생성
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
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
  });
});
