import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import {
  CategoryResolver,
  DishResolver,
  RestaurnatResolver,
} from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';
import { CategoryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';

/**
 * * CustomRepository를 사용하기 위해서 forFeature()에 기본 Entity를 넣지말고, 직접 Repository 상속받아 구현한 CustomRepository를 대신 넣어준다.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CategoryRepository, Restaurant, Dish])],
  providers: [
    RestaurantService,
    RestaurnatResolver,
    CategoryResolver,
    DishResolver,
  ],
})
export class RestaurantsModule {}
