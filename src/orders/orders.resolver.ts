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
import { Inject } from '@nestjs/common';
import { NEW_PENDING_ORDER, PUB_SUB } from '../common/common.constants';
import { PubSub } from 'graphql-subscriptions';

@Resolver((of) => Order)
export class OrderResolver {
  constructor(
    private readonly orderSerivce: OrderService,
    // * CommonModule(@Global)의 provider에 정의되어 있기 때문에 @Inject를 이용해 사용 가능
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

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

  @Subscription((returns) => Order, {
    // * 함수의 어떤  argument를 신경쓰고 싶지 않을 때, _라고 값을 준다.
    // * 여기서는 variables를 신경쓰지 않겠다는 의미
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      console.log('payload.ownerId: ', ownerId);
      console.log('context.user.id: ', user.id);
      console.log('_', _);
      return ownerId === 3;
    },
    resolve: ({ pendingOrders: { order } }) => order, // * payload에 들어있는 값 중 order만 찐 payload로 리턴
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  //*//////////////////////////////////////////////////////
  //*//////////////////////////////////////////////////////
  //*//////////////////////////////////////////////////////
  // * 아래는 수업용 예시
  //*//////////////////////////////////////////////////////
  //*//////////////////////////////////////////////////////
  //*//////////////////////////////////////////////////////
  @Mutation((returns) => Boolean)
  async potatoReady(@Args('potatoId') potatoId: number) {
    /**
     * * pubsub.publish(triggerName: string, payload: object)
     * * TriggerName: pubsub.asyncIterator에서 listening 하겠다고 명시한 trigger이름이랑 일치
     * * payload:key값은 subscription인 resolver 이름, value는 원하는 메세지
     */
    await this.pubSub.publish('HotPotatos', {
      readyPotato: potatoId,
    });
    return true;
  }

  // * 실제로 string을 return 하는 것은 아니다. (실제 리턴: asyncIterator)
  // * subscription은 이벤트를 listening 중이다.
  @Subscription((returns) => String, {
    filter: ({ readyPotato }, { potatoId }, context) => {
      console.log(
        'payload.readyPotato: ',
        readyPotato,
        'variables.potatoId',
        potatoId,
        context,
      );
      // * payload: trigger에서 넘어오는 값
      // * variables: listening을 하기 전에 현재 subscription에서 받는 args값
      // * context: GraphQLModule과 Guard 등등을 통해서 설정해둔 context
      return readyPotato === potatoId; // * return이 true인 경우에만 trigger를 받는다.
    },
    // * resolve: 사용자가 받는 update 알림의 형태를 바꿔준다.
    // * resolve?: (payload: any, args: any, context: any, info: any) => any | Promise<any>;
    resolve: ({ readyPotato }) =>
      `Your potato with the id_${readyPotato} is ready`,
  })
  @Role(['Any'])
  readyPotato(@Args('potatoId') potatoId: number) {
    /**
     * * PubSubEngine.asyncIterator<unknown>(triggers: string | string[]): AsyncIterator<unknown, any, undefined>
     * * trigger: 우리가 기다리는 이벤트 => 어떤 string이 들어가도 상관없다.
     */
    return this.pubSub.asyncIterator('HotPotatos'); // * trigger에서 보낸 payload 출력
  }
}
