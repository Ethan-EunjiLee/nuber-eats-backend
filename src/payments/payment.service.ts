import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { LessThan, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    // * cron job => dynamic 방식으로 cron job 사용 가능
    private schedulerRegistry: SchedulerRegistry,
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

      // * restaurant에도 promote 여부 표시
      restaurant.isPromoted = true;
      // * promote 기간 표시(결제 후 7일동안)
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;

      await this.restaurants.save(restaurant);

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

  // * promote 날짜 체크 후 기간 지났으면 만료시키기
  // * 여기서는 Interval을 이용했지만 cron을 이용해 24시 기준으로 해주면 좋을 것 같다
  @Interval(2000)
  async checkPromoteRestaurants() {
    // * 오늘 날짜가 지난 promotedUntil을 가지고 있는 restaurant만 출력
    const restaurants = await this.restaurants.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });
    console.log('checkPromoteRestaurants restaurants: ', restaurants);
    // * 광고 기간 지난 restaurant의 isPromoted, promotedUntil 필드 값 업데이트
    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;

      await this.restaurants.save(restaurant);
    });
  }

  // * Task Scheduleing(Cron)
  // @Cron('30 * * * * *', { name: 'myJob' }) // * 매 30초마다(30초 간격 X, 초침이 30초를 가리킬때)
  // async checkForPayments() {
  //   console.log('check for payments... cron');
  //   const job = this.schedulerRegistry.getCronJob('myJob');
  //   job.stop();
  // }
  //
  // * Task Scheduleing(Interval)
  // @Interval(5000) // * 매 30초마다
  // async checkForPaymentsI() {
  //   console.log('check for payments... Interval');
  // }
  //
  // @Timeout(20000) // * 앱 실행 후 20초가 지나면 딱 1번만 실행
  // afterStarts() {
  //   console.log('Congrats!');
  // }
}
