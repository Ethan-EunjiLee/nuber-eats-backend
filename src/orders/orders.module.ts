import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './orders.service';
import { OrderResolver } from './orders.resolver';
import { Order } from './entity/order.entity';

// * providers: 사용한 서비스, 리졸버 등을 넣어준다.
@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
