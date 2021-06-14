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
  private async sendEmail(subject: string, content: string) {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.emailDomain}>`);
    form.append('to', 'dev.eunji.lee@gmail.com'); // * 누구에게 이메일 보낼거니?
    form.append('subject', subject);
    form.append('text', content);

    try {
      // * api:내 api key를 buffer에 넣어 만들고 base64타입으로 인코딩
      // * BASE64 인코딩 - mailgun 규칙
      // * 글자 잘못입력하면 안넘어가니까 주의하자
      await got(
        `https://api.mailgun.net/v3/${this.options.emailDomain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
    } catch (error) {
      console.log(
        '🚀 ~ file: mail.service.ts ~ line 42 ~ MailService ~ sendEmail ~ error',
        error,
      );
    }
  }

  sendVerificationEmail(email: string, code: string) {
    console.log('sendVerificationEmail');
    this.sendEmail('verify your email', code);
  }
}
