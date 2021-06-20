import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum } from 'class-validator';
import { Restaurant } from '../../restaurant/entities/restaurant.entity';

/**
 * * type으로 설정된 UserRole을 enum으로 변경
 * * type UserRole = 'client' | 'owner' | 'delivery';
 *
 * * [주의] Column(enum: UserRole)보다 밑에 적혀있으면 에러 발생
 * *
 */
enum UserRole {
  Client,
  Owner,
  Delivery,
}

// * GraphQL에 enum 등록하기
// * => 이렇게 등록하고 나면 @Field 데코레이터에서 enum을 등록할 수 있다.
registerEnumType(UserRole, { name: 'UserRole' });

/**
 * ! User에만 해당되는 내용을 다루는 Entity
 * * 공통되는 부분은 CommonModule에서 제작
 */

// * abstract 타입이기 때문에 playground의 schema탭에서 확인할 수 없으나, InputType name을 따로 설정했기 때문에 컴퓨터에서는 다르게 인식된다... 뭔소리임?
// * InputType의 이름을 다르게 설정!
@InputType('UserInputType', { isAbstract: true }) // * GraphQL
@ObjectType() // * GraphQL
@Entity() // * Postgres
export class User extends CoreEntity {
  // * unique: true => 테이블의 유일한 값이어야 한다.(중복 불가)
  @Column({ unique: true }) // * Postgres
  @Field((type) => String) // * GraphQL
  @IsEmail()
  email: string;

  // TODO: 이렇게 바꿔버리면, hash는 막을 수 있지만, 그 외 로직에서 에러 발생...
  @Column({ select: false }) // * Postgres
  @Field((type) => String) // * GraphQL
  password: string;

  @Column({ type: 'enum', enum: UserRole }) // * Postgres
  @Field((type) => UserRole) // * GraphQL
  @IsEnum(UserRole)
  role: UserRole;

  // * Verification을 위해 추가한 칼럼 -> User의 email verify 여부 체크 필요
  @Column({ default: false }) // 기본값 false
  @Field((type) => Boolean)
  @IsBoolean()
  verified: boolean;

  // * (restaurant) => restaurant.owner:: 반대편에 해당되는 내용
  // * User(owner)가 가진 레스토랑은 있을 수도, 없을 수도
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  @Field((type) => [Restaurant])
  restaurants: Restaurant[];

  @BeforeInsert() // * db에 넣기 전에 비밀번호 암호화
  @BeforeUpdate() // * 업데이트전에 비밀번호 암호화, 그러나, verifyEmail 메소드에서 save()를 통해 verified를 변경하는 과정에서 또 암호화 발생
  // * -> entity를 가져온 후 → js에서 직접 entity를 수정한 후 → save()를 이용해 entity를 update
  async hashPassword(): Promise<void> {
    // * bcrypt.hash(데이터, saltOrRounds)
    // * saltRounds 주로 10을 추천 -> 암호화 몇번?
    // * resolver에서 Repository.save() 하기전에 호출해서 비번을 암호화한다

    if (this.password) {
      // * 넘어온 entity 객체에 password가 없는 경우 암호화 X
      try {
        // * create()에서 만든 entity 인스턴스를 save에 넣기 전에 인스턴스의 password 낚아채서 처리
        this.password = await bcrypt.hash(this.password, 10);
        console.log('hasspassword: ', this.password);
      } catch (error) {
        console.log('error: ', error);
        // * 여기서 예외 던지면, service의 catch에서 잡는다.
        // * createAccount try-catch
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      // *  입력받은 aPassword와 이메일 일치해서 만든 User 객체의 password를 비교
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
