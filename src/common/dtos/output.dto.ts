import { Field, ObjectType } from '@nestjs/graphql';

// ! oupput Account
@ObjectType()
export class CoreOutput {
  @Field((type) => String, { nullable: true })
  error?: string;

  @Field((type) => Boolean)
  ok: Boolean;
}
