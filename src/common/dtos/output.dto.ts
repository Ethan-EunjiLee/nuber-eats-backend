import { Field, ObjectType } from '@nestjs/graphql';

// ! oupput Account
@ObjectType()
export class MutationOutput {
  @Field((type) => String, { nullable: true })
  error?: string;

  @Field((type) => Boolean)
  ok: Boolean;
}
