import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';

@InputType({ isAbstract: true })
@Entity()
@ObjectType()
// * CoreEntity: User에서도 상속한 공통 핵심 Entity
export class Restaurant extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((tyep) => String, { defaultValue: '강남' })
  @Column()
  @IsString()
  address: string;
}
