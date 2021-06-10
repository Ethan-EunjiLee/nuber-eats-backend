import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { UsersModule } from '../users.module';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum, IsString, isString } from 'class-validator';

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
@InputType({ isAbstract: true }) // * GraphQL
@ObjectType() // * GraphQL
@Entity() // * Postgres
export class User extends CoreEntity {
  @Column() // * Postgres
  @Field((type) => String) // * GraphQL
  @IsEmail()
  email: string;

  @Column() // * Postgres
  @Field((type) => String) // * GraphQL
  password: string;

  @Column({ type: 'enum', enum: UserRole }) // * Postgres
  @Field((type) => UserRole) // * GraphQL
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    // * bcrypt.hash(데이터, saltOrRounds)
    // * saltRounds 주로 10을 추천 -> 암호화 몇번?
    // * resolver에서 Repository.save() 하기전에 호출해서 비번을 암호화한다

    try {
      // * create()에서 만든 entity 인스턴스를 save에 넣기 전에 인스턴스의 password 낚아채서 처리
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      console.log('error: ', error);
      // * 여기서 예외 던지면, service의 catch에서 잡는다.
      // * createAccount try-catch
      throw new InternalServerErrorException();
    }
  }
}
