import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

// * Any: 로그인되기만 하면 접근 가능한 곳을 설정하기 위해서
export type AllowedRoles = keyof typeof UserRole | 'Any';

// * @SetMetadata대신 @Role로 사용하기 위해 커스터마이징
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
