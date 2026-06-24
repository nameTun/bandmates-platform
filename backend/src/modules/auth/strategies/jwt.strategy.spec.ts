import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockUsersService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockUsersService = {
      findUserById: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    const payload = { userId: 'user-uuid' };

    it('should return safe user object if valid and active', async () => {
      const mockUser = {
        id: 'user-uuid',
        role: 'student',
        email: 'test@example.com',
        isActive: true,
      };
      mockUsersService.findUserById.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(mockUsersService.findUserById).toHaveBeenCalledWith(payload.userId);
      expect(result).toEqual({
        id: mockUser.id,
        role: mockUser.role,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findUserById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      mockUsersService.findUserById.mockResolvedValue({
        id: 'user-uuid',
        isActive: false,
      });

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
