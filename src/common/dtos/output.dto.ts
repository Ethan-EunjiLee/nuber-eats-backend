import { Field, ObjectType } from '@nestjs/graphql';

// ! output Account
@ObjectType()
export class CoreOutput {
  @Field((type) => String, { nullable: true })
  error?: string;

  @Field((type) => Boolean)
  ok: boolean;
}
