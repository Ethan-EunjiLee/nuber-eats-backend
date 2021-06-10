import { Field } from '@nestjs/graphql';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ! CoreEntity
 * ! :모든 다른 Entity들은 id가 설정되어 있는 CoreEntity를 상속받아 구현한다
 */
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field((type) => Number) // * GraphQL
  id: number;

  @CreateDateColumn()
  @Field((type) => Date) // * GraphQL
  createdAt: Date;

  @UpdateDateColumn()
  @Field((type) => Date) // * GraphQL
  updatedAt: Date;
}
