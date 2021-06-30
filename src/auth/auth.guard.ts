import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { AllowedRoles } from './role.decorator';
import { User } from '../users/entities/user.entity';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';

// * Guard는 true or false 리턴밖에 못한다
// * http, websocket 모두를 위해 호출된다.

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService, // * 삭제한 JwtMiddleware 역할을 수행하기 위해 가져옴
    private readonly userService: UsersService,
  ) {}
  // * ExecutionContext: 일반 컨텍스트 => GraphQLModule의 forRoot에서 context항목에서 공유하려고 넣어둔 값들이 포함된다.
  async canActivate(context: ExecutionContext) {
    // * @Role 데코레이터로 설정한 값 가져오기
    // *  => metadataKey: SetMetadata의 키값
    // *  => target: 주로 context.getHandler();
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    // * role을 설정하지 않은 경우 resolver가 public이라는 의미기 때문에 바로 true로 처리해 request를 진행시킨다.
    if (!roles) {
      return true; // * Guard의 return이 ture인 경우 request 진행 허용
    }
    // * 일반 Context를 GqlExecutionContext.create()의 파라미터로 넣어 graphQL Context로 변경
    const gqlContext = GqlExecutionContext.create(context).getContext();

    console.log('guard gqlContext.token: ', gqlContext.token);
    // * 위랑 똑같다 >> console.log('guard gqlContext.token: ', gqlContext['token']);

    const token = gqlContext.token;
    if (token) {
      // * 토큰이 있는 경우 해당 토큰에서 user 정보 찾는다.
      const decoded = this.jwtService.verify(token.toString());

      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        // * 자바스크립트의 객체에서 키값을 이용해 값을 부르는 방법: 객체['키값'] => console.log(decoded['id']);

        // * findById가 ok까지 주는거로 수정되는 바람에 여기도 수정했다.
        // * const  user  = await this.userService.findById(decoded['id']);
        const { user } = await this.userService.findById(decoded['id']);

        if (!user) {
          // TODO: Exception filter만들어서 false 때 발생하는 403 에러 처리해보자
          // * metadata가 설정된 경우 확인 필요, 없는 경우에는 확인 X
          return false; // * return false: 어디서 사용되더라도 request를 막는다.
        }
        gqlContext['user'] = user;
        // * metadata가 Any로 설정된 경우: 로그인만 되어있으면 누구나 접근 가능
        if (roles.includes('Any')) {
          return true;
        }
        // * metadata에서 얻어온 roles 배열 중 user.role과 일치하는 값이 있으면 true 없으면 false 리턴
        // * ex) roles: ["Delivery"] user.role: "Owner" => return false
        return roles.includes(user.role);
      } else {
        // * 토큰이 문제가 있는 경우
        return false;
      }
    } else {
      // * 토큰이 없는 경우 false!
      return false;
    }
  }
}
