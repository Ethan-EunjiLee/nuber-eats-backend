import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql'
import { CoreOutput } from 'src/common/dtos/output.dto'
import { User } from '../entities/user.entity'

// * User 클래스에서 email, password 속성을 가져와서 dto 생성
// * 단, non required
// * => Combine! Partial(전체 + non required) + pick(원하는 속성만)
@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}

@ObjectType()
export class EditProfileOutput extends CoreOutput {}
