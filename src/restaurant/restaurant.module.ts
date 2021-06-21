import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurnatResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';
import { Category } from './entities/category.entity';

/**
 * ! 테스트 Module
 */
@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  providers: [RestaurnatResolver, RestaurantService],
})
export class RestaurantsModule {}
