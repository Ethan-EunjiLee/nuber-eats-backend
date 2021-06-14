// ! forRoot()를 통해 입력할 옵션들을 위한 클래스
export interface MailModuleOptions {
  apiKey: string;
  emailDomain: string;
  fromEmail: string;
}

export interface EmailVar {
  key: string;
  value: string;
}
