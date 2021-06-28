import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Order, OrderStatus } from '../entity/order.entity';
import { CoreEntity } from '../../common/entities/core.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class GetOrdersInput {
  // * 배달 상태에 따라 주문 확인 가능
  @Field((type) => OrderStatus, { nullable: true })
  status: OrderStatus;
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  // * 선택 옵션에 따라 주문 리스트 확인 가능
  @Field((type) => [Order], { nullable: true })
  orders?: Order[];
}
