import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { Role } from '@zurich/shared';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = { get: jest.fn().mockReturnValue('test-secret') } as unknown as ConfigService;
    strategy = new JwtStrategy(configService);
  });

  describe('validate', () => {
    it('should return the jwt payload with sub and role', () => {
      const payload = { sub: 'user-1', role: Role.ADMIN };
      const result = strategy.validate(payload);
      expect(result).toEqual({ sub: 'user-1', role: Role.ADMIN });
    });

    it('should work with user role', () => {
      const payload = { sub: 'user-2', role: Role.USER };
      const result = strategy.validate(payload);
      expect(result.role).toBe(Role.USER);
    });
  });
});
