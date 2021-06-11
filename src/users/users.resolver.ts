import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
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

  @Query((returns) => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    console.log('me authUser: ', authUser);
    return authUser;

    /**
     * * me(@Context() { potato }): 이렇게하면 context에서 원하는 값 가져올 수 있다.
     *
     * * @Context() context
     * * GraphQLModule.forRoot()에서 추가로 넣어줄 수 있다 뿐이지,
     * * context로 접근하면 기존 req값들 다 받아올 수 있다.
     */
  }

  // ! 프로필 보기
  @UseGuards(AuthGuard)
  @Query((returns) => UserProfileOutput)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findById(userProfileInput.userId);

      if (!user) {
        throw Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        error: 'User Not Found',
        ok: false,
      };
    }
  }
}
