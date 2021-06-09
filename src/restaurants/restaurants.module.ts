import { Module } from '@nestjs/common';
import { RestaurnatResolver } from './restaurants.resolver';

/**
 * ! 테스트 Module
 */
@Module({
  providers: [RestaurnatResolver],
})
export class RestaurantsModule {}
