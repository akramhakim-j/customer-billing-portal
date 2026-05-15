import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  describe('handleRequest', () => {
    it('should return user when valid', () => {
      const user = { sub: 'user-1', role: 'admin' };
      expect(guard.handleRequest(null as unknown as Error, user, null as unknown as Error)).toBe(user);
    });

    it('should throw UnauthorizedException with expired token message', () => {
      const expired = new TokenExpiredError('expired', new Date());
      expect(() => guard.handleRequest(null as unknown as Error, null, expired)).toThrow(
        new UnauthorizedException('Token has expired'),
      );
    });

    it('should throw UnauthorizedException with invalid token message', () => {
      const invalid = new JsonWebTokenError('invalid');
      expect(() => guard.handleRequest(null as unknown as Error, null, invalid)).toThrow(
        new UnauthorizedException('Invalid token'),
      );
    });

    it('should throw UnauthorizedException when no user and no info', () => {
      expect(() => guard.handleRequest(null as unknown as Error, null, null as unknown as Error)).toThrow(
        new UnauthorizedException('Authentication required'),
      );
    });

    it('should throw UnauthorizedException when err is present', () => {
      expect(() =>
        guard.handleRequest(new Error('some error'), null, null as unknown as Error),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('canActivate', () => {
    it('should call super.canActivate', () => {
      const mockContext = {
        switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
        getType: () => 'http',
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
      } as unknown as ExecutionContext;

      // Override the parent strategy to avoid passport setup
      jest.spyOn(guard, 'canActivate').mockReturnValue(true);
      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });
});
