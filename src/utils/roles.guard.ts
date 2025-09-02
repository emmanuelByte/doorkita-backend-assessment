import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { IUserRequest } from '../types/express';
import { UserRole } from '../users/entities/user.entity';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<IUserRequest>();
    const user = request.user;

    // If no user is present, deny access
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role;

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. User role: ${userRole}`,
      );
    }

    return true;
  }
}
