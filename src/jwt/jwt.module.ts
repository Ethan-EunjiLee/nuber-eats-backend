import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

// * Global 모듈로 설정해주면, import없이도 전역에서 해당 Service를 전역에서 사용 가능
@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        // * BANANAS라는 이름으로 option을 JwtService에 inject하기 위해 명시
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
        /**
         * * providers: [JwtService]
         * * 의미: {
         * * provider: JwtService,
         * * useClass: JwtService
         * * }
         */
      ],
      exports: [JwtService],
    };
  }
}
