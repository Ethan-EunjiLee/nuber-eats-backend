import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Order } from './entity/order.entity';
import { OrderService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../auth/role.decorator';
import { AuthUser } from '../auth/auth-user.decorator';

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
}
