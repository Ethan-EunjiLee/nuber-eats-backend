import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, RelationId, OneToMany } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from './category.entity';
import { User } from '../../users/entities/user.entity';
import { Dish } from './dish.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@Entity()
@ObjectType()
// * CoreEntity: User에서도 상속한 공통 핵심 Entity
export class Restaurant extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field((tyep) => String)
  @Column()
  @IsString()
  address: string;

  // * Category의 restaurants 부분 참조
  // * Category가 지워지더라도, Restaurant는 지워지면 안된다!
  // *   => ManyToOne의 속성으로 onDelete: 'SET NULL',  nullable: true 추가
  // *   => GraphQL(@Field)에도 nullable: true 추가
  @ManyToOne(() => Category, (category) => category.restaurants, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field((type) => Category, { nullable: true })
  category: Category;

  // * 모든 레스토랑은 owner가 필요하기 때문에 nullable: fase
  // * User는 여러개의 restaurant을 가질 수 있지만, restaurant는 1개의 user만 owner로 설정 가능
  // * 레스토랑은 반드시 owner가 설정되어야한다.
  // * { onDelete: 'CASCADE' } User 삭제되면 Restaurant도 삭제한다
  @ManyToOne((type) => User, (user) => user.restaurants, {
    onDelete: 'CASCADE',
  })
  @Field((type) => User)
  owner: User;

  // * Relation 중 User와의 관계에서 user의 id값을 가져오고 싶을때
  // * DB테이블에 칼럼으로 뜨는건 아니다.
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  // * Dish와의 관계 정의(Restaurant는 많은 Dish를 가지고, Dish는 한 개의 Restaurant를 가진다.)
  // * (dish) => dish.restaurant
  // * :: 반대쪽에서는 dish.restaurant를 통해 Restaurant Entity와 연결한다.(restaurant는 Dish Entity에서 선언한 변수명)
  @OneToMany((type) => Dish, (dish) => dish.restaurant)
  @Field((type) => [Dish])
  menu: Dish[];
}
