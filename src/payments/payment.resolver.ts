import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { Role } from '../auth/role.decorator';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { GetPaymentsOutput } from './dtos/get-payments.dto';

// * payment는 삭제, 수정 불가 create, read만 가능하게 구현

@Resolver((of) => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation((returns) => CreatePaymentOutput)
  @Role(['Owner'])
  createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(owner, createPaymentInput);
  }

  @Query((returns) => GetPaymentsOutput)
  @Role(['Owner'])
  getPayments(@AuthUser() user: User): Promise<GetPaymentsOutput> {
    return this.paymentService.getPayments(user);
  }
}
