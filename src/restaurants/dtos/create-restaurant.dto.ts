import { ArgsType, Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/restaurant.entity';

// * @ArgsType() // * resolver에서 @Args()의 이름을 지정하지 않은 경우
// * @InputType() // * resolver에서 @Args()의 이름을 지정해준 경우

// * Mapped Types의 OmitTypes를 이용해 DTO 작성: Restaurant Entity에서 id를 제외한 모든 값을 input하는 InputType 생성
// * OmitType(참조할 클래스, 그 중 제외할 속성, 변경할 Type)
// * 만약, ParentClass에 @InputType({isAbstract: true})가 있다면, 마지막 옵션은 없어도 된다.
// * validation은 ParentClass에서 설정해주면 된다.
@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}

// * Mapped Types 없이 직접 DTO 작성
// export class CreateRestaurantDto {
//   @Field((type) => String)
//   @IsString()
//   @Length(5, 10) // * 길이가 최소 5, 최대 10 이어야 한다. => 조건 안맞을 경우 에러 발생
//   name: string;

//   @Field((type) => Boolean)
//   @IsBoolean()
//   isVegan: boolean;

//   @Field((type) => String)
//   @IsString()
//   address: string;

//   @Field((type) => String)
//   @IsString()
//   ownerName: string;
// }
