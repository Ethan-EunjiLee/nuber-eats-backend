import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

// * @InputType(): resolver에서 @Args()의 이름을 지정해준 경우
@ArgsType() // * resolver에서 @Args()의 이름을 지정하지 않은 경우
export class CreateRestaurantDto {
  @Field((type) => String)
  @IsString()
  @Length(5, 10) // * 길이가 최소 5, 최대 10 이어야 한다. => 조건 안맞을 경우 에러 발생
  name: string;

  @Field((type) => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field((type) => String)
  @IsString()
  address: string;

  @Field((type) => String)
  @IsString()
  ownerName: string;
}
