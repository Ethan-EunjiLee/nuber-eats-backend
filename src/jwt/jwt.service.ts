import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

@Injectable()
export class JwtService {
  constructor(
    // * 모듈에서 서비스로 inject할 때 사용
    // * forRoot의 providers에 넣은 provide값이랑 일치 필수! useValue에 사용된 이름이랑은 일치 상관 X
    @Inject(CONFIG_OPTIONS)
    private readonly options: JwtModuleOptions, // private readonly configService: ConfigService,
  ) {
    console.log('CONFIG_OPTIONS: ', options);
  }
  sign(userId: number): string {
    console.log(
      '🚀 ~ file: jwt.service.ts ~ line 20 ~ JwtService ~ sign ~ userId',
      userId,
    );

    return jwt.sign({ id: userId }, this.options.privateKey);
    // * 위와 동일: return jwt.sign(payload, this.configService.get('PRIVATE_KEY'));
  }
  // ! 토큰 확인 함수
  verify(token: string): string | object {
    return jwt.verify(token, this.options.privateKey);
  }
}
