import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from '../restaurant/entities/restaurant.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  // * 주문 => resolver에서 @Role을 사용했기 때문에 로그인 유저임을 확신하고 코드 진행 가능
  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    // * [1] 입력한 restaurantId와 일치하는 restaurant 찾기
    const restaurant = await this.restaurants.findOne(restaurantId);
    // * 일치하는 레스토랑이 없는 경우
    if (!restaurant) {
      return {
        ok: false,
        error: 'Not found restaurant',
      };
    }

    const order = await this.orders.save(this.orders.create({ customer }));
    console.log('order: ', order);
  }
}
