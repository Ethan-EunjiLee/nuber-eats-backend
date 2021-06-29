import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { Order } from './entity/order.entity';
import { OrderService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../auth/role.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

@Resolver((of) => Order)
export class OrderResolver {
  constructor(private readonly orderSerivce: OrderService) {}

  @Role(['Client'])
  @Mutation((returns) => CreateOrderOutput)
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderSerivce.createOrder(customer, createOrderInput);
  }

  @Role(['Any'])
  @Query((returns) => GetOrdersOutput)
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderSerivce.getOrders(user, getOrdersInput);
  }

  @Role(['Any'])
  @Query((returns) => GetOrderOutput)
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.orderSerivce.getOrder(user, getOrderInput);
  }

  @Mutation((returns) => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderSerivce.editOrder(user, editOrderInput);
  }

  // * 실제로 string을 return 하는 것은 아니다. (실제 리턴: asyncIterator)
  @Subscription((returns) => String)
  orderSubscription() {
    /**
     * * PubSubEngine.asyncIterator<unknown>(triggers: string | string[]): AsyncIterator<unknown, any, undefined>
     * * trigger: 우리가 기다리는 이벤트 => 어떤 string이 들어가도 상관없다.
     */
    return pubsub.asyncIterator('HotPotatos');
  }
}
