import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/output.dto';
import { Dish } from '../../restaurant/entities/dish.entity';
import { Order } from '../entity/order.entity';

@InputType()
export class CreateOrderInput extends PickType(Order, ['items']) {
  @Field((type) => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
