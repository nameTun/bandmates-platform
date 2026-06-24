import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

// Mock the cookie utility functions independently
jest.mock('../../common/utils/cookie.util', () => ({
  setCookies: jest.fn(),
  clearCookie: jest.fn(),
}));

import { setCookies, clearCookie } from '../../common/utils/cookie.util';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  // Mock the Express Response object
  const mockRes = {
    passthrough: true,
  } as unknown as Response;

  beforeEach(async () => {
    // Mock the AuthService dependency
    mockAuthService = {
      registerUser: jest.fn().mockResolvedValue({
        tokens: { accessToken: 'access-123', refreshToken: 'refresh-456' },
        user: { id: 'user-id', email: 'test@example.com' },
      }),
      loginUser: jest.fn().mockResolvedValue({
        tokens: { accessToken: 'access-123', refreshToken: 'refresh-456' },
        user: { id: 'user-id', email: 'test@example.com' },
      }),
      logoutUser: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call AuthService to create a user and set the refresh token cookie', async () => {
      const dto = { email: 'test@example.com', name: 'Test', password: '123' };
      const result = await controller.register(dto, mockRes);

      expect(mockAuthService.registerUser).toHaveBeenCalledWith(dto);
      expect(setCookies).toHaveBeenCalledWith(expect.any(Object), mockRes, 'refresh-456');
      expect(result).toEqual({
        accessToken: 'access-123',
        user: { id: 'user-id', email: 'test@example.com' },
      });
    });
  });

  describe('login', () => {
    it('should call AuthService to authenticate and set the refresh token cookie', async () => {
      const dto = { email: 'test@example.com', password: '123' };
      const result = await controller.login(dto, mockRes);

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(dto);
      expect(setCookies).toHaveBeenCalledWith(expect.any(Object), mockRes, 'refresh-456');
      expect(result.accessToken).toBe('access-123');
    });
  });

  describe('logout', () => {
    it('should revoke token in DB and clear the cookie from the response', async () => {
      const userId = 'user-uuid';
      const result = await controller.logout(userId, mockRes);

      expect(mockAuthService.logoutUser).toHaveBeenCalledWith(userId);
      expect(clearCookie).toHaveBeenCalledWith(expect.any(Object), mockRes);
      expect(result).toEqual({ message: 'Logged out' });
    });
  });
});
