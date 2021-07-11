import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurant/entities/restaurant.entity';

// * 프론트 작업 진행 후 해당 모델 변경 가능

@InputType('PaymentInputType', { isAbstract: true })
@Entity()
@ObjectType()
export class Payment extends CoreEntity {
  // * 거래 번호
  @Field((type) => String)
  @Column()
  transactionId: string;

  /**
   * * user의 payment에는 관심을 가져야 하기 때문에 OneToMany까지 설정해주었지만,
   * * restaurant의 payment에는 관심이 없기 때문에 OneToMany를 작성하지 않았다.
   */

  // * 광고 신청자
  @Field((type) => User)
  // * User는 여러 Payment를 가질 수 있기 때문에 ManyToOne
  // * ManyToOne은 반대편에 OneToMany가 없어도 생성 가능(단, OneToMany는 반드시 반대편이 ManyToOne이 있어야한다)
  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  // * 어떤 relation으로부터의 값인지를 표현해줘야한다.
  @RelationId((payment: Payment) => payment.user)
  userId: number;

  // * 광고 신청할 음식점
  // * User가 여러개의 음식점을 가질 수 있기 때문에, 그 중 어느 음식점을 광고할지도 선택해서 출력해줘야 한다.
  @Field((type) => Restaurant)
  @ManyToOne(() => Restaurant)
  restaurant: Restaurant;

  @RelationId((payment: Payment) => payment.restaurant)
  @Field((type) => Int)
  restaurantId: number;
}
