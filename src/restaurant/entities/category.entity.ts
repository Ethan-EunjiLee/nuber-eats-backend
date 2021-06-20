import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Entity, Column, OneToMany } from 'typeorm';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from '../../common/entities/core.entity';
import { Restaurant } from './restaurant.entity';

// * 이 부분을 스키마로 정의해서 등록할거니? 아니면 true
// * InputType에서 이름을 지정해주지않으면, ObjectType과 InputType의 이름이 같아진다.
// * 그러면 unique해야한다는 속성을 위배해서 에러 발생
@InputType('CategoryInputType', { isAbstract: true })
@Entity()
@ObjectType()
/**
 * * Category와 Restaurant는 1:N의 관계
 * * => 1개의 Category는 여러개의 Restaurant을 가진다.
 */
export class Category extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImage: string;

  // * 1개의 카테고리는 여러개의 Restaurant를 가질 수 있다.
  // * restaurant => restaurant.category:: 반대쪽 entity에 대해 설명! 반대 entity의 category 속성과 매칭된다.
  // * 이 부분은 Category 테이블의 행으로 추가되지 않는다! 관계 표시용
  // * 카테고리에 해당되는 레스토랑은 있을 수도, 없을 수도
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.category)
  @Field((type) => [Restaurant])
  restaurants: Restaurant[];
}
