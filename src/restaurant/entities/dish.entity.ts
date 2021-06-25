import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { IsNumber, IsString, Length } from 'class-validator';
import { Restaurant } from './restaurant.entity';

// * choices가 주문의 값을 변경하는 경우 사용
@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field((type) => String)
  name: string;

  @Field((type) => Int, { nullable: true })
  extra?: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field((type) => String)
  name: string;

  @Field((type) => [DishChoice], { nullable: true })
  // choices?: string[];
  choices?: DishChoice[];

  @Field((type) => Int, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@Entity()
@ObjectType()
export class Dish extends CoreEntity {
  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5, 140)
  description: string;

  // * Restaurant와의 관계 정의(Restaurant는 많은 Dish를 가지고, Dish는 한 개의 Restaurant를 가진다.)
  // * (restaurant) => restaurant.menu
  // * :: 반대쪽에서는 restaurant.menu를 통해 Dish Entity와 연결한다. (menu는 Restaurant Entity에서 선언한 이름)
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE', // * Restaurant가 사라질 때 소속된 Dish도 사라진다.
    // * nullable: false, // ManyToOne은 nullable true가 기본값. 그래서 없어도 값이 생성된다.
  })
  @Field((type) => Restaurant)
  restaurant: Restaurant;
  // * relation에서 레스토랑의 id값만 가져온다.
  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  // * 옵션 추가
  // * json을 사용하는 이유: 특정 형태를 가진 데이터 저장, 구조화된 데이터 저장
  // * type:json은 mySQL, postgreSQL만 지원
  @Field((type) => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
