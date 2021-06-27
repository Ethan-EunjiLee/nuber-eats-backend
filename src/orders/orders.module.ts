import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './orders.service';
import { OrderResolver } from './orders.resolver';
import { Order } from './entity/order.entity';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { OrderItem } from './entity/order-item.entity';
import { Dish } from '../restaurant/entities/dish.entity';

// * providers: 사용한 서비스, 리졸버 등을 넣어준다.
@Module({
  imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
  providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
