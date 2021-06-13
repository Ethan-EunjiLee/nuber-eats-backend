import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@InputType({ isAbstract: true }) // * ObjectType()보다 밑에 적혀 있으면 에러 발생
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  /**
   * * CoreEntity: id, createdAt, updatedAt
   */

  //* verification code
  @Column()
  @Field((type) => String)
  code: string;

  /**
   * * [관계 테이블 사이, 부모 테입르 삭제했을 때 자식 테이블 어떻게 처리할지 설정]
   * * CASCADE: 부모 테이블 삭제하면, 관련된 자식 테이블 삭제
   * * SET NULL: user null로 처리
   * * 그 외 다수 ...
   */
  @OneToOne((type) => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  // * DB 삽입 전에 code 만들기
  // * createAccount, editProfile 단에 추가하여, email이 변동, 삽입되면 verification을 넣어준다.
  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4(); // * === uuid.v4(): 하이픈이 포함된 uuid가 출력된다.
  }
}
