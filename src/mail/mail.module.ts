import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interface';
import { MailService } from './mail.service';

@Module({})
@Global() // * 나중에도 전역에서 사용할 수 있도록 Global로 설정 >> 다른 곳에서 바로 호출 가능(직접적인 inject 사용 없이도)
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: CONFIG_OPTIONS, // * Service의 Constructor에서 @Inject()를 통해 값을 넣을 때 사용하는 이름과 일치시켜야 한다. => 그래야 얘를 주입하지
          useValue: options,
        },
        MailService,
        /**
         * * providers: [JwtService]
         * * 의미: {
         * * provider: JwtService,
         * * useClass: JwtService
         * * }
         */
      ],
      exports: [MailService],
    };
  }
}
