import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

/**
 * * APP_GUARD
 * *  => nestjs에서 제공된 constants
 * *  => guard를 앱 모든 곳에서 사용하고 싶다면, APP_GUARD를 provide하면 된다.
 */

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
