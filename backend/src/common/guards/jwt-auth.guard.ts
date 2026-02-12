// backend/src/common/guards/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Simplified - in production, validate JWT token
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    // Extract token and validate (you'd use a real JWT validation service)
    const token = authHeader.split(' ')[1];

    // For now, accept any token that exists
    // TODO: Implement proper JWT validation
    if (token) {
      request.user = { id: 'user-id-from-token', roles: ['user'] };
      return true;
    }

    return false;
  }
}