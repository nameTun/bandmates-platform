import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TokenService } from '../../common/services/token.service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock the bcrypt library to avoid actual hashing overhead during tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: any;
  let mockTokenService: any;

  beforeEach(async () => {
    // Mock the UsersService dependency
    mockUsersService = {
      findUserByEmail: jest.fn(),
      findUserByEmailWithPassword: jest.fn(),
      findUserByIdWithRefreshToken: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      updateProfile: jest.fn(),
    };

    // Mock the TokenService dependency
    mockTokenService = {
      getTokens: jest.fn().mockResolvedValue({
        accessToken: 'mocked-access-token',
        refreshToken: 'mocked-refresh-token',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const dto = { email: 'test@example.com', name: 'Test User', password: 'password123' };

    it('should successfully register a user and return tokens', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(null);
      
      const hashedPassword = 'hashed_password123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const savedUser = {
        id: 'user-uuid',
        email: dto.email,
        name: dto.name,
        role: 'student',
        profile: { id: 'prof-1', displayName: dto.name, isOnboardingCompleted: false, avatarUrl: '' }
      };
      mockUsersService.createUser.mockResolvedValue(savedUser);

      const result = await service.registerUser(dto);

      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        email: dto.email,
        name: dto.name,
        password: hashedPassword, 
      });
      expect(result.tokens.accessToken).toBe('mocked-access-token');
      expect(result.user.id).toBe('user-uuid');
      expect(result.user).not.toHaveProperty('password'); 
    });

    it('should throw ForbiddenException if email already exists', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue({ id: 'existing-uuid' });

      await expect(service.registerUser(dto)).rejects.toThrow(ForbiddenException);
      expect(mockUsersService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    const dto = { email: 'test@example.com', password: 'password123' };
    
    it('should successfully login and return tokens when credentials are valid', async () => {
      const mockDBUser = {
        id: 'user-uuid',
        email: dto.email,
        password: 'hashed_password123',
        isActive: true,
        role: 'student',
        profile: null,
      };
      
      mockUsersService.findUserByEmailWithPassword.mockResolvedValue(mockDBUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.loginUser(dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, mockDBUser.password);
      expect(result.tokens.accessToken).toBe('mocked-access-token');
    });

    it('should throw UnauthorizedException if user not found or invalid credentials', async () => {
      mockUsersService.findUserByEmailWithPassword.mockResolvedValue(null);
      await expect(service.loginUser(dto)).rejects.toThrow(UnauthorizedException);

      mockUsersService.findUserByEmailWithPassword.mockResolvedValue({ id: '1', password: 'hash', isActive: true });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.loginUser(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is disabled (isActive = false)', async () => {
      mockUsersService.findUserByEmailWithPassword.mockResolvedValue({
        id: '1',
        password: 'hash',
        isActive: false
      });

      await expect(service.loginUser(dto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('logoutUser', () => {
    it('should clear refreshToken for the user', async () => {
      mockUsersService.updateUser.mockResolvedValue(true);
      await service.logoutUser('user-uuid');
      expect(mockUsersService.updateUser).toHaveBeenCalledWith('user-uuid', { refreshToken: null });
    });
  });

  describe('refreshTokens', () => {
    const userId = 'user-uuid';
    const oldToken = 'old-refresh-token';

    it('should return new tokens if valid', async () => {
      const mockUser = { id: userId, isActive: true, refreshToken: oldToken };
      mockUsersService.findUserByIdWithRefreshToken.mockResolvedValue(mockUser);

      const result = await service.refreshTokens(userId, oldToken);

      expect(mockTokenService.getTokens).toHaveBeenCalledWith(mockUser);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, { refreshToken: 'mocked-refresh-token' });
      expect(result.tokens.accessToken).toBe('mocked-access-token');
    });

    it('should throw ForbiddenException if user not found or no refresh token in DB', async () => {
      mockUsersService.findUserByIdWithRefreshToken.mockResolvedValue(null);
      await expect(service.refreshTokens(userId, oldToken)).rejects.toThrow(ForbiddenException);

      mockUsersService.findUserByIdWithRefreshToken.mockResolvedValue({ id: userId, refreshToken: null });
      await expect(service.refreshTokens(userId, oldToken)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if provided token does not match DB token', async () => {
      mockUsersService.findUserByIdWithRefreshToken.mockResolvedValue({ id: userId, refreshToken: 'different-token' });
      await expect(service.refreshTokens(userId, oldToken)).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException if account is disabled', async () => {
      mockUsersService.findUserByIdWithRefreshToken.mockResolvedValue({ id: userId, refreshToken: oldToken, isActive: false });
      await expect(service.refreshTokens(userId, oldToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateGoogleUser', () => {
    const details = { email: 'google@test.com', name: 'Google User', googleId: 'g123', avatarUrl: 'http://img.com' };

    it('should create and return a new user if not found', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue({ id: 'new-id', ...details });

      const result = await service.validateGoogleUser(details);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(details);
      expect(result.id).toBe('new-id');
    });

    it('should link googleId and sync avatar if user exists but lacks them', async () => {
      const existingUser = { id: 'u1', email: details.email, isActive: true, profile: { avatarUrl: null } };
      mockUsersService.findUserByEmail.mockResolvedValue(existingUser);

      const result = await service.validateGoogleUser(details);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith('u1', { googleId: 'g123' });
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('u1', { avatarUrl: 'http://img.com' });
      expect(result.googleId).toBe('g123');
    });

    it('should throw UnauthorizedException if existing user account is disabled', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue({ id: 'u1', email: details.email, isActive: false });
      await expect(service.validateGoogleUser(details)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateFacebookUser', () => {
    const details = { email: 'fb@test.com', name: 'FB User', facebookId: 'fb123', avatarUrl: 'http://img.com' };

    it('should create and return a new user if not found', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue({ id: 'new-id', ...details });

      const result = await service.validateFacebookUser(details);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(details);
      expect(result.id).toBe('new-id');
    });

    it('should link facebookId and sync avatar if user exists but lacks them', async () => {
      const existingUser = { id: 'u1', email: details.email, isActive: true, profile: { avatarUrl: null } };
      mockUsersService.findUserByEmail.mockResolvedValue(existingUser);

      const result = await service.validateFacebookUser(details);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith('u1', { facebookId: 'fb123' });
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('u1', { avatarUrl: 'http://img.com' });
      expect(result.facebookId).toBe('fb123');
    });

    it('should throw UnauthorizedException if existing user account is disabled', async () => {
      mockUsersService.findUserByEmail.mockResolvedValue({ id: 'u1', email: details.email, isActive: false });
      await expect(service.validateFacebookUser(details)).rejects.toThrow(UnauthorizedException);
    });
  });
});
