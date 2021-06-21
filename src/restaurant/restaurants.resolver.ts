import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { SetMetadata } from '@nestjs/common';
import { Role } from '../auth/role.decorator';

@Resolver((of) => Restaurant)
export class RestaurnatResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation((returns) => CreateRestaurantOutput)
  // * SetMetadata를 사용하면 Reflector class를 이용해 metadata를 반영시킬 수 있다.
  // * 설정된 Metadata는 AuthGuard에서 어떻게 사용할지 정의
  @Role(['Owner'])
  async createRestaurant(
    @Args('input') createResataurantInput: CreateRestaurantInput,
    @AuthUser() authUser: User,
  ): Promise<CreateRestaurantOutput> {
    return await this.restaurantService.createRestaurant(
      authUser,
      createResataurantInput,
    );
  }
}
