import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
import * as FormData from 'form-data';
import got from 'got';
import { TEST_ENV } from '@nestjs/schematics';
import exp from 'constants';

// * 외부 모듈 mock
jest.mock('got'); // * got는 그 자체로 function이기 때문에  return 필요 X
jest.mock('form-data');
// jest.mock('form-data', () => {
//   return {
//     append: jest.fn(), // * 함수에 따로 return 값이 없다면, 여기서 마무리
//   };
// });

const TEST_DOMAIN = 'test-emailDomain';

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
            emailDomain: TEST_DOMAIN,
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

      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
        return true;
      });

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

  describe('sendEmail', () => {
    it('sends email', async () => {
      const ok = await service.sendEmail('', '');

      // * form.append()가 잘 불러지는지
      // * prototype: 자바스크립트 함수형 객체를 클래스처럼 쓸 수 있게 해준다.
      // * FormData를 구현할 필요는 없다! 그냥 Spy만 필요 => 그래서 mockImplementation 없음
      // * 상단에 FormData를 import해야 spy고 뭐고 가능
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalled();

      // * got이 잘 실행되는지(string, object와 함께)
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`, // * 주입 여부 테스트
        expect.any(Object),
      );
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(ok).toEqual(true);
    });
    it('fails on error', async () => {
      // * mock으로 에러 got.post가 error 던지도로고 구현
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      const ok = await service.sendEmail('', '');

      expect(ok).toEqual(false);
    });
  });
});
