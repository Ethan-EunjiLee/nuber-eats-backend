import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtMiddleware } from 'src/jwt/jwt.middleware';
import { JwtModule } from 'src/jwt/jwt.module';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

/**
 * ! imports
 * * TypeOrmModule.forFeature([User]): User DB와 연결할 Repository
 * * TypeOrmModule.forFeature([Verification]): Verification DB와 연결할 Repository
 *
 * * ConfigModule은 AppModule에서 isGloble=true로 설정되었기 때문에 imports, providers 배열에 없어도 알아서 끌어온다.
 * * 원래는 Service를 사용하려면 Module을 우선 import해야한다.
 */

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Verification /* ,ConfigService */]),
  ],
  providers: [UsersService, UsersResolver /* JwtService*/],
  exports: [UsersService],
})
export class UsersModule {}
