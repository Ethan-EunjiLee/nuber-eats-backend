import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  JoinTable,
  RelationId,
} from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurant/entities/restaurant.entity';
import { Dish } from '../../restaurant/entities/dish.entity';
import { OrderItem } from './order-item.entity';
import { IsEnum, IsNumber } from 'class-validator';

export enum OrderStatus {
  Pending = 'Pending', // * 대기
  Cooking = 'Cooking', // * 요리 => 식당이 변경
  Cooked = 'Cooked', // * 음식이 픽업을 기다리는 상태 => 식당이 변경
  PickedUp = 'PickedUp', // * 배달원이 변경
  Delivered = 'Delivered', // * 배달원이 변경
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@Entity()
@ObjectType()
export class Order extends CoreEntity {
  // * 1개의 주문은 1명의 유저를 가지지만, 1명의 유저는 여러 주문을 가질 수 있다.
  @Field((type) => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL', //* user를 지우더라도 order를 지우지 않기 위해서
    nullable: true,
  })
  customer?: User;

  // * 어떤 relation으로부터의 값인지를 표현해줘야한다.
  @RelationId((order: Order) => order.customer)
  customerId: number;

  // * 주문과 동시에 드라이버가 배정되는 것이 아니기 때문에 nullable: true
  @Field((type) => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL', //* user를 지우더라도 order를 지우지 않기 위해서
    nullable: true,
  })
  driver?: User;

  // * 어떤 relation으로부터의 값인지를 표현해줘야한다.
  @RelationId((order: Order) => order.driver)
  driverId: number;

  // * 1개의 레스토랑은 many 주문을 가질 수 있다.
  @Field((type) => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL', //* user를 지우더라도 order를 지우지 않기 위해서
    nullable: true,
  })
  restaurant?: Restaurant;

  // * 1개의 dish는 여러 order를 받을 수 있다.
  // * 1개의 order 역시 여러 dish를 가질 수 있다.
  // * 위와 같은 관계를 many to many라고 한다.
  // * @JoinTable()의 경우 더 메인인 곳에 넣어주면 된다라고 은지쓰는 이해쓰...
  // * Order는 Dish를 봐야하지만, Dish는 얼마나 많은 order를 받았는지 알 필요 X
  // @Field((type) => [Dish])
  // @ManyToMany(() => Dish)
  // @JoinTable()
  // dishes: Dish[];

  @Field((type) => [OrderItem])
  @ManyToMany(() => OrderItem)
  @JoinTable()
  items: OrderItem[];

  // * 총액: 9.99같은게 나올 수 있으니끼 Float으로 지정
  @Column({ nullable: true })
  @Field((type) => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @Field((type) => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
