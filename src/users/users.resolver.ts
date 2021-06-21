import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import { Role } from '../auth/role.decorator';

@Resolver((of) => User) // * User와 관련된 Resolver임을 명시, 괄호 내부 생략 가능
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // ! 회원가입
  @Mutation((returns) => CreateAccountOutput) // * error? ok!
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
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

  // ! AuthUser: 현재 로그인한 사람의 정보 출력
  @Query((returns) => User)
  // @UseGuards(AuthGuard)
  @Role(['Any']) // * 모든 User는 누구나 자신의 정보를 볼 수 있다.
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
  //@UseGuards(AuthGuard)
  @Query((returns) => UserProfileOutput)
  @Role(['Any'])
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(userProfileInput.userId);
  }

  // ! userProfile 수정
  // * AuthUser: 현재 로그인한 사람의 정보 출력
  // @UseGuards(AuthGuard)
  @Role(['Any'])
  @Mutation((returns) => EditProfileOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);

    // try {
    //   console.log(
    //     '🚀 ~ file: users.resolver.ts ~ line 101 ~ UsersResolver ~ editProfileInput',
    //     editProfileInput,
    //   );

    //   console.log(
    //     'editProfie Resolver: ',
    //     await this.usersService.editProfile(authUser.id, editProfileInput),
    //   );

    //   return {
    //     ok: true,
    //   };
    // } catch (error) {
    //   return {
    //     ok: false,
    //     error,
    //   };
    // }
  }

  @Mutation((returns) => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(verifyEmailInput.code);

    // try {
    //   await this.usersService.verifyEmail(verifyEmailInput.code); // * false인 경우 verifyEmail에서 Error로 던짐
    //   return {
    //     ok: true,
    //   };
    // } catch (error) {
    //   return {
    //     ok: false,
    //     error,
    //   };
    // }
  }
}
