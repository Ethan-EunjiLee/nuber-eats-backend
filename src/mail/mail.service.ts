import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interface';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    // * Module의 forRoot()의 providers에서 변수 내용을 보낼 때 사용하는 provide와 이름이 일치해야 해당 값이 여기로 주입된다.
    @Inject(CONFIG_OPTIONS)
    private readonly options: MailModuleOptions, //
  ) {}

  // ! 이메일 보내기
  async sendEmail(subject: string, content: string): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.emailDomain}>`);
    form.append('to', 'dev.eunji.lee@gmail.com'); // * 누구에게 이메일 보낼거니?
    form.append('subject', subject);
    form.append('text', content);

    try {
      // * api:내 api key를 buffer에 넣어 만들고 base64타입으로 인코딩
      // * BASE64 인코딩 - mailgun 규칙
      // * 글자 잘못입력하면 안넘어가니까 주의하자
      // * 원래는 got 모듈 그대로 썼는데, spec.ts에서 test하기 위해 post로 변경
      await got.post(
        `https://api.mailgun.net/v3/${this.options.emailDomain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    console.log('sendVerificationEmail');
    this.sendEmail('verify your email', code);
  }
}
