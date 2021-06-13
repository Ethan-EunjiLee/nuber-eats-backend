import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Verification } from '../entities/verification.entity';

// * ObjectType() 클래스를 그대로 상속받았다 하더라도 자식 클래스에도 @ObjectType()이 입력되어야 한다.
@ObjectType()
export class VerifyEmailOutput extends CoreOutput {}

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}
