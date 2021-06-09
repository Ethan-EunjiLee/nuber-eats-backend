import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

/**
 * ! 테스트 Resolver
 */

/**
 * * 이 Resolver는 Restaurant의 resolver 임을 명시, 괄호 내부는 생략 가능
 * * 단, 직관적으로 코드를 작성하고 싶다면, 추가하는게 좋다.
 */
@Resolver((of) => Restaurant)
export class RestaurnatResolver {
  /**
   * * [설명]
   * * @Query(ReturnTypeFunc인 typeFunc 입력 필수!): Method Decorator
   * * Query가 return하고자 하는 type을 return 하는 function이어야 한다.
   * * 작성한 함수가 return하는 타입과 일치되어야 한다.
   *
   * * [작성법]
   * * @Query(() => Boolean) === @Query(returns => Boolean)
   * * 여기서 returns는 별 의미 없다. 어떤 방식으로 작성해도 무관
   *
   * * [예시]
   * * @Query((returns) => Boolean) // * 여기서 Boolean은 graphQL을 위해서 명시(필수)
   * * isPizzaGood(): Boolean { // * 여기서 Boolean은 typescript를 위해서 명시(선택)   * *
   * *  return true;
   * * }
   */

  /**
   * * 대괄호를 이용한 배열 Array 표시
   * * typescript: Restaurant[]
   * * GraphQL: [Restaurant]   *
   */

  @Query((returns) => [Restaurant])
  // * veganOnly라는 args가 넘어올건데, 이건 boolean 타입이다.
  // * 여기서 적용된  boolean은 ts, graphQL 모두에 적용
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    console.log(
      '🚀 ~ file: restaurants.resolver.ts ~ line 24 ~ RestaurnatResolver ~ restaurants ~ veganOnly',
      veganOnly,
    );
    return [];
  }

  /**
   * * [Args가 여러개 필요한 경우]
   * * Args를 하나하나 작성해도 되지만, Dto를 만들어 @InputType 데코레이터를 달아준 후
   * * 입력 받을 객체의 타입을 정의해준 후 끌어와도 된다.
   *
   * * 구버전 예시 --> 이렇게 해줘도 노상관
   * * @Args('name') name: string,
   * * @Args('isVegan') isVegan: boolean,
   * * @Args('address') address: string,
   * * @Args('ownerName') ownerName: string,
   *
   * * 신버전 예시
   * * @Args('createRestaurantInput') createRestaurntInput: CreateRestaurantDto
   * * 객체 타입은 Dtos 폴더에 dto.ts 파일 생성하여 내부에 @inputType, @field 데코레이터를 사용하여 설정
   */
  @Mutation((returns) => Boolean)
  createRestaurant(
    @Args() createRestaurntDto: CreateRestaurantDto,
    // * @Args('createRestaurantInput') createRestaurntInput: CreateRestaurantDto,
    // * 만약 playground에서 createRestaurantInput 이름을 이용해 가져오기 귀찮다면,
    // * 이 이름은 생략 가능 => 대신, dto에서 inputType을 ArgsType으로 변경 필요
  ): boolean {
    console.log(
      '🚀 ~ file: restaurants.resolver.ts ~ line 68 ~ RestaurnatResolver ~ createRestaurntDto',
      createRestaurntDto,
    );
    return true;
  }
}
