import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { GetPaymentsOutput } from './dtos/get-payments.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      // * 일치하는 restaurant 가져오기
      const restaurant = await this.restaurants.findOne(restaurantId);

      // * 레스토랑이 없는 경우
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }

      // * restaurant의 onwerId와 현재 로그인한 유저의 id가 일치하지 않는 경우
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You are not allowed to do this',
        };
      }

      // * payment 생성
      await this.payments.save(
        this.payments.create({
          transactionId,
          restaurant,
          user: owner,
        }),
      );

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create payment',
      };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({ user: user });
      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load payments',
      };
    }
  }
}
