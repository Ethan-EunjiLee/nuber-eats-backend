import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from './category.entity';
import { User } from '../../users/entities/user.entity';

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
  coverImage: string;

  @Field((tyep) => String, { defaultValue: '강남' })
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
  // * 레스토랑은 반드시 owner가 설정됭어ㅑ 한다.
  @ManyToOne((type) => User, (user) => user.restaurants)
  @Field((type) => User)
  owner: User;
}