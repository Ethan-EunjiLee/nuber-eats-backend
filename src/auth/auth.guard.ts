import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { AllowedRoles } from './role.decorator';
import { User } from '../users/entities/user.entity';

// * Guard는 true or false 리턴밖에 못한다

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
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

    // * 일반 Http Context를 graphQL Context로 변경
    const gqlContext = GqlExecutionContext.create(context).getContext();
    //console.log('gqlContext: ', gqlContext);
    //const { user } = gqlContext;
    const user: User = gqlContext['user']; // * 'user' => gqlContext 배열 객체의 key name

    if (!user) {
      // TODO: Exception filter만들어서 false 때 발생하는 403 에러 처리해보자
      // * metadata가 설정된 경우 확인 필요, 없는 경우에는 확인 X
      return false; // * return false: 어디서 사용되더라도 request를 막는다.
    }
    if (roles.includes('Any')) {
      return true;
    }
    // * metadata에서 얻어온 roles 배열 중 user.role과 일치하는 값이 있으면 true 없으면 false 리턴
    // * ex) roles: ["Delivery"] user.role: "Owner" => return false
    return roles.includes(user.role);
  }
}
