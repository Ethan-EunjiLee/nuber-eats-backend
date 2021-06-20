import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OldRestaurant } from './entities/restaurant.entity';
import { OldRestaurnatResolver } from './restaurants.resolver';
import { OldRestaurantService } from './restaurants.service';

/**
 * ! 테스트 Module
 */
@Module({
  imports: [TypeOrmModule.forFeature([OldRestaurant])],
  providers: [OldRestaurnatResolver, OldRestaurantService],
})
export class OldRestaurantsModule {}
