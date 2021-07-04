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
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from '../common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';

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

  // * dirver만 볼 수 있는 기능 peding pickedup order => OrderStatus가 Cooked 되면 확인
  @Subscription((returns) => Order)
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  // * 음식 준비 상태 업데이트 될 때 마다 출력
  // * 단, 필터를 이용해 user의 id가 일치하는 경우에만
  @Subscription((returns) => Order, {
    // * filter에는 payload(pubSub publish에서 넘어오는 값), variables(subscription에서 설정한 값), context(context에서 설정한 값)이 변수로 들어온다.
    filter: (
      // * 구조 분해 할당 타입 지정 방식 { 끄집어온 변수 } : {끄집어온 변수 : 해당 변수의 타입}
      // * 구조 분해 할당 시 alias 설정 방법: {끄집어온 변수 : alias}
      { orderUpdates: order }: { orderUpdates: Order }, // * orderUpdates는 Order 타입
      { input }: { input: OrderUpdatesInput }, // * input은 OrderUpdatesInput 타입
      { user }: { user: User }, // * context에 들어있던 user는 User 타입
    ) => {
      console.log('orderUpdateInput(id값만 설정) )variables.input: ', input);
      console.log('payload.orderUpdates: ', order);

      // * 해당 주문에 관련된 사람이 아니면 filter에서 false로 걸러진다.
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        // * Order Entity의 Eager Relations를 해두었기 때문에 ownerId까지 다 가져올 수 있다.
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      // * payload에서 넘어온 order객체의 id와 subscription이 input으로 받은 id 값이 같은 경우만 이벤트 받겠다.
      return order.id === input.id;
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdateInput: OrderUpdatesInput) {
    // * 필터에서 관련자 아니면 거른 부분은 여기서도 구현 가능
    // * 대신, order 여부 부터 체크 필요
    ////////////////////////////////////////////////////////////////////////
    // * iterator를 service에서 리턴해서 구현하는 방법도 있다.
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }

  // * 완성된 order가 driver에게 할당된다.
  @Mutation((returns) => TakeOrderOutput)
  @Role(['Delivery'])
  takeOrder(
    @AuthUser() driver: User,
    @Args('input') takeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    return this.orderSerivce.takeOrder(driver, takeOrderInput);
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
    // * filter: filter?: (payload: any, variables: any, context: any) => boolean | Promise<boolean>;
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
