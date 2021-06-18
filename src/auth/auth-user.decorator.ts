import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// * 데코레이터 만들기
// * AuthUser: 데코레이터 이름

// ! AuthUser: 현재 로그인한 사람의 정보 출력

export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    console.log('here is AuthUser Decorator');
    // * AuthGuard에서 graphQL context 보내주는거 아니고, 더 진행할지 말지 boolean만 보내니까
    // * 여기서 다시 user객체 쓰고 싶으면 처리 필요
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    return user;
  },
);
