import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { OldCreateRestaurantDto } from './create-restaurant.dto';
import { OldRestaurantsModule } from '../restaurants.module';

// * 해당 ts 파일에서만 사용하고 외부로 빼지 않기 때문에 export할 필요 없음
@InputType()
class OldUpdateRestaurantInputType extends PartialType(
  OldCreateRestaurantDto,
) {}

@ArgsType()
export class OldUpdateRestaurantDto {
  @Field((type) => Number)
  id: number;

  @Field((type) => OldUpdateRestaurantInputType)
  data: OldUpdateRestaurantInputType;
}
