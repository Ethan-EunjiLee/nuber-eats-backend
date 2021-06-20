import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * * GraphQL의 type과 TypeORM의 Entity는 같은 클래스에서 선언하여 사용 가능
 *
 * * Entity() 칼럼을 이용해 TypeORM에서 사용할 Entity를 만들면,
 * * 해당 Entity가 자동으로 해당 DB에 들어간다.
 */

/**
 * * 한 스키마는 한 개의 Type을 가져야한다.
 * * => 그래서 @InputType() 데코레이터를 그냥 추가하면 에러 발생
 * * => 해결방법: @InputType({isAbstract: true})
 * *    나는 이걸 abstract로 만들었어. 이건 스키마에 포함되길 원치 않고, 어디 다른데서 복사하려고 만들어두는거야! 라는 의미
 * *    이걸 상단에 입력하면, 참조해서 새로 만드는 DTO에서 extends 하는 옵션에 InputType을 넣지 않아도 된다.
 */
@InputType({ isAbstract: true })
@Entity()
@ObjectType()
export class OldRestaurant {
  // *  PrimaryColumn이 없으면 Entity가 생성되지 않는다.
  @PrimaryGeneratedColumn()
  @Field((is) => Number)
  id: number;

  @Column()
  @Field((is) => String) // * 이 필드는 String 타입이다. @Field(()=>String)으로 적어도 무관
  @IsString()
  @Length(5, 10)
  name: string;

  /**
   * * isVegan 해석
   * *  - 값은 있어도 되고 없어도 되는데, 있는 경우엔 boolean이어야 하고, 입력이 안된 경우는 true로 처리
   */
  @IsOptional() // * value가 있는지 보고, 만약 없다면 설정된 validator 무시
  @Column({ default: true }) // * 입력된 값이 없는 경우 default값인 true를 넣는다.
  @Field((type) => Boolean, { defaultValue: true })
  @IsBoolean()
  isVegan?: boolean;

  @Column()
  @Field((type) => String, { defaultValue: 'GangNam' })
  @IsString()
  address: string;

  @Column()
  @Field((type) => String)
  @IsString()
  ownerName: string;

  @Column()
  @Field((type) => String)
  @IsString()
  categoryName: string;

  /**
   * * @Field() 내부에는 returnTypeFunc, option(선택)이 들어간다.
   * * option 예시
   * * - {nullable: true}: null 가능
   */
}
