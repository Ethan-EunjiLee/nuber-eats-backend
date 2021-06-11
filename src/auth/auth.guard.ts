import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    // * 일반 Http Context를 graphQL Context로 변경
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const { user } = gqlContext; // * === const user = gqlContext['user']

    console.log('here is AuthGuard: ', user);

    // TODO: Exception filter만들어서 false 때 발생하는 403 에러 처리해보자
    if (!user) {
      return false; // * return false: 어디서 사용되더라도 request를 막는다.
    } else {
      return true;
    }
  }
}
