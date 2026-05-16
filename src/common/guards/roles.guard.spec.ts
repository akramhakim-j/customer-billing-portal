import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../shared';
import { ExecutionContext } from '@nestjs/common';

const mockContext = (role: Role | undefined): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { sub: 'user-1', role } : undefined }),
    }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(mockContext(Role.USER))).toBe(true);
  });

  it('should allow admin to access admin-only route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    expect(guard.canActivate(mockContext(Role.ADMIN))).toBe(true);
  });

  it('should throw ForbiddenException when user tries to access admin-only route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(mockContext(Role.USER))).toThrow(ForbiddenException);
  });

  it('should allow both admin and user to access shared routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN, Role.USER]);
    expect(guard.canActivate(mockContext(Role.USER))).toBe(true);
    expect(guard.canActivate(mockContext(Role.ADMIN))).toBe(true);
  });
});
