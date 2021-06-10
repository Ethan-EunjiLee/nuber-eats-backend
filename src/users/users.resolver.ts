import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver((of) => User) // * User와 관련된 Resolver임을 명시, 괄호 내부 생략 가능
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => Boolean)
  hi(): Boolean {
    return true;
  }

  // ! 회원가입
  @Mutation((returns) => CreateAccountOutput) // * error? ok!
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      // * 배열에 들어있는 값을 순서대로 각각 ok, error로 정의
      return this.usersService.createAccount(createAccountInput);
    } catch (err) {
      return {
        error: err,
        ok: false,
      };
    }
  }

  // ! 로그인
  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return this.usersService.login(loginInput);
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
