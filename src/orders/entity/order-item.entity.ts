import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import {
  Dish,
  DishChoice,
  DishOption,
} from '../../restaurant/entities/dish.entity';

@InputType('OrderItemOptionInputType', { isAbstract: true }) // * isAbstract: true => 스키마 등록을 막아준다.
@ObjectType()
export class OrderItemOption {
  @Field((type) => String)
  name: string;

  // * 기존의 DishChoice인 경우 User에게 얼마 낼건지를 물어보는꼴... 그러면 안되기 때문에 string으로만 변경
  @Field((type) => String, { nullable: true })
  choice?: string;
}
// * OrderItem은 Order에 들어가는 여러개의 음식 메뉴들을 옵션과 함께 각각으로 분리한 값
// * 그래서 1개의 OrderItem에는 1개의 Dish만 매칭, 반대로 1개의 Dish에는 여러 OrderItem 매칭 가능
@InputType('OrderItemInputType', { isAbstract: true })
@Entity()
@ObjectType()
export class OrderItem extends CoreEntity {
  // * ManyToOne을 사용할 때 꼭 OneToMany를 설정해주거나, inverse 옵션을 설정해줄 필요는 없다.
  // * 반대쪽 관계에서 접근하고 싶을때만 해주면 된다.
  @Field((type) => Dish)
  @ManyToOne((type) => Dish, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  dish: Dish;

  // * DishOption이 단독 entity인 경우,
  // * 주인이 Entity를 수정할 때, 이전 주문때 선택했던 DishOption들이 영향을 받는다.
  // * 이걸 차단하고 싶으면 그냥 정보를 따로 받아서 text처럼 처리해줘야한다.
  // * 이렇게 따로 저장해두면 주인이 옵션 바꿔도 내 기존 주문에는 영향을 미치지 않는다.
  @Field((type) => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
