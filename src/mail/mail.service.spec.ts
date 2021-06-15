import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

// * 외부 모듈 mock
jest.mock('got', () => {}); // * got는 그 자체로 function이기 때문에  return 필요 X
jest.mock('form-data', () => {
  return {
    append: jest.fn(), // * 함수에 따로 return 값이 없다면, 여기서 마무리
  };
});

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'test-apiKey',
            emailDomain: 'test-emailDomain',
            fromEmail: 'test-fromEmail',
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {});
  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };
      // * 실제 함수는 expect에 넣어 사용할 수 없다. 사용 가능 함수: mock, spy
      // * mock으로 만들 수 없는 경우, spy로 만들어서 사용하면 된다.

      /**
       * * 원래 함수를 이용해 spy 함수 만들기
       * * 1. jest.spyOn(함수가 있는 변수, 함수 이름).mockImplementation()
       * *      - mockImplementation: 함수 내부의 값들을 전부 mock
       * *      - 해당 변수가 호출되면, 가로채서(intercept) 나만의 구현(implementation) 추가
       *
       */

      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {});

      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'verify your email',
        sendVerificationEmailArgs.code,
      );
    });
  });
});
