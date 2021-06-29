import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entity/order.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { OrderItem } from './entity/order-item.entity';
import { Dish } from '../restaurant/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  // * 주문 => resolver에서 @Role을 사용했기 때문에 로그인 유저임을 확신하고 코드 진행 가능
  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      // * [1] 입력한 restaurantId와 일치하는 restaurant 찾기
      const restaurant = await this.restaurants.findOne(restaurantId);
      // * 일치하는 레스토랑이 없는 경우
      if (!restaurant) {
        return {
          ok: false,
          error: 'Not found restaurant',
        };
      }
      console.log('items: ', items);
      items.forEach((item) => console.log('items forEach(): ', item));

      // * 모든 dish 주문의 총액
      let orderFinalPrice = 0;
      // * orderItems
      const orderItems: OrderItem[] = [];
      // * forEach() 내부에서  return을 해봤자, createOrder의 진행을 막을 수 없다.
      // * 그래서 forEach() 에서 for of(배열순환) 로 변경
      for (const item of items) {
        // * 일치하는 요리 정보 찾기
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          // * order 전체 과정 취소
          // * abord this whole thing
          return {
            ok: false,
            error: 'dish not found',
          };
        }
        // * dish별 최종 가격 변수
        let dishFinalPrice = dish.price;
        console.log(`dish.price: ${dish.price}원`);
        // * user가 주문한 옵션을 살펴보기 => 일치하는 옵션들의 extra값을 더해 총액을 구하기 위해서
        for (const itemOption of item.options) {
          console.log('itemOption: ', itemOption);
          // * dishId를 통해 찾은 dish에서의 옵션과 사용자 주문 option 비
          // * 유저의 주문과 일치하는 option값을 찾는다.
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          console.log('dishOption: ', dishOption);
          if (dishOption) {
            // * 옵션의 세부 선택 사항이 없는 경우(ex. 피클 추가)
            if (dishOption.extra) {
              console.log(`dishOption.extra: ${dishOption.extra}원`);
              // * 최종가격에 옵션 금액 추가
              dishFinalPrice += dishOption.extra;
            } else {
              // * 옵션의 세부 선택 사항이 있는 경우(ex. 사이즈 변경에 따른 금액 차이 발생)
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => itemOption.choice === optionChoice.name,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  // * 최종 금액에 옵션 금액 추가
                  dishFinalPrice += dishOptionChoice.extra;
                  console.log(
                    `dishOptionChoice.extra: ${dishOptionChoice.extra}원`,
                  );
                }
              }
            }
          }
        }
        console.log(`final dish.price: ${dishFinalPrice}원`);
        orderFinalPrice += dishFinalPrice;
        console.log(`orderFinalPrice: ${orderFinalPrice}원`);
        const orderItem = await this.orderItems.save(
          this.orderItems.create({ dish, options: item.options }),
        );
        // * orderItems array에 orderItem들을 쌓아 넣는다.
        // * orderItem: 주문한 여러 Dish 중 한 Dish에 대한 정보
        // * orderItems: 주문한 전체 Dish를 포함하는 주문 정보
        orderItems.push(orderItem);
      }
      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );
      console.log('order: ', order);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create order',
      };
    }
  }

  // * 주문 내역 보기
  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        // * 로그인한 유저의 주문 내역 가져오기
        orders = await this.orders.find({
          where: {
            customer: user,
            ...(status && { status }), // * status가 있는 경우만 object에 추가
          },
        });
        console.log('client');
      } else if (user.role === UserRole.Delivery) {
        // * 로그인한 유저의 배달 내역 가져오기
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
            // * status가 있는 경우만 object에 추가
            // * ...은 spresad 연산자
            // * 자바스크립트는 {}는 코드 블럭으로 인식하기 때문에, ()로 감싸줘야 표현식으로 해석된다.
            // * status를 입력하지 않는 경우 모든 status를 다 끌고온다.
          },
        });
        console.log('delivery');
      } else if (user.role === UserRole.Owner) {
        // * 로그인한 user가 가진 restaurant 가져오기
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          // * select: ['orders'], // * 레스토랑 정보 전체가 필요한 것이 아니기 때문에 orders 정보만 가져오기로 선택
          relations: ['orders', 'orders.customer'], // * 해당 레스토랑이 가진 주문 정보도 같이 load
        });
        // * array.map(cb): 기존 array의 각 항목을 cb를 이용해 변환한 후 새로운 배열로 출력
        // * 여기서는 orders만 모아서 새 배열 생성 => 비어있는 order는 빈 채로 출력된다.
        // * flat을 이용하면 배열을 원하는 깊이의 요소까지 외부로 끌고와 평탄하게 만들고 구멍도 제거 가능
        console.log('restaurants: ', restaurants);
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
        //* 따로 지정한 status가 있는 경우
        if (status) {
          /**
           * * - map vs filter
           * * - 공통점: 기존 배열은 건드리지 않으면서 요소들을 순회한 후 새로운 배열을 리턴
           * * - 차이점
           * *    - map: 콜백 함수가 적용된 새 요소들을 리턴
           * *    - filter: 조건문을 만족한 요소들을 반환
           */
          // * orders의 값 중 status가 일치하는 값만 가져다가 다시 orders로 만든다.
          // orders = orders.map((order) => {
          //   if (order.status === status) return order;
          // });
          orders = orders.filter((order) => order.status === status);
          console.log('ordersssss: ', orders);
        }
        console.log('orders: ', orders);
      }
      return {
        ok: true,
        orders,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }

  // * 주문을 볼 수 있는지 체크
  canSeeOrder(user: User, order: Order): boolean {
    // * order user 연관관계 체크 => 로그인한 유저가 주문자, 배달, 식당 주인이 아닌 경우 false return
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }
  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput, // * 타입 지정하는 방법과 똑같이 alias 지정 가능
  ): Promise<GetOrderOutput> {
    try {
      // * id값 일치하는 order 찾기
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'], // * driver, customer는 relationId를 통해 id값만 가져왔다.
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }
      // * anSeeOrder(): order user 연관관계 체크 => 로그인한 유저가 주문자, 배달, 식당 주인이 아닌 경우 false return
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: 'you cannot see that',
        };
      }
      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load order',
      };
    }
  }
  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput, // * orderId alias로 활용
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });
      // * 해당 주문이 있는지 체크
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }
      // * 이 주문을 user가 볼 수 있는지 체크
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: 'Cannot see this',
        };
      }
      // * 순서: 유저 role 확인 => status 확인 => order 업데이트
      let canEdit = true;
      // * 유저가 손님인 경우(주문 변경 불가)
      if (user.role === UserRole.Client) {
        canEdit = false;
      }
      // * 유저가 주인인 경우
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      }
      // * 유저가 배달원인 경우
      if (user.role === UserRole.Delivery) {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      }
      if (!canEdit) {
        return {
          ok: false,
          error: 'You cannot do that',
        };
      }
      await this.orders.save([{ id: orderId, status }]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit',
      };
    }
  }
}
