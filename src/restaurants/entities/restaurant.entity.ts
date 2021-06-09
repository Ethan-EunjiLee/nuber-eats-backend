import { Field, ObjectType } from '@nestjs/graphql';

// * GraphQL의 관점에서 본 Restaurant 묘사

@ObjectType()
export class Restaurant {
  @Field((is) => String) // * 이 필드는 String 타입이다. @Field(()=>String)으로 적어도 무관
  name: string;

  @Field((type) => Boolean)
  isVegan?: boolean;

  @Field((type) => String)
  address: string;

  @Field((type) => String)
  ownerName: string;

  /**
   * * @Field() 내부에는 returnTypeFunc, option(선택)이 들어간다.
   * * option 예시
   * * - {nullable: true}: null 가능
   */
}
