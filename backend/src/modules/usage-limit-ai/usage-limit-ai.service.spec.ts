import { Test, TestingModule } from '@nestjs/testing';
import { UsageLimitAiService, UsageAction } from './usage-limit-ai.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsageLimitAi } from './entities/usage-limit-ai.entity';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException } from '@nestjs/common';

// Mock ioredis globally to prevent actual Redis connections during tests
jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => {
      return {
        zremrangebyscore: jest.fn().mockResolvedValue(0),
        zcard: jest.fn().mockResolvedValue(0),
        zadd: jest.fn().mockResolvedValue(1),
        expire: jest.fn().mockResolvedValue(1),
        zrem: jest.fn().mockResolvedValue(1),
        disconnect: jest.fn(),
      };
    }),
  };
});

// Extract the mocked Redis client to assert its methods later
import { Redis } from 'ioredis';

describe('UsageLimitAiService', () => {
  let service: UsageLimitAiService;
  let mockUsageRepository: any;
  let mockConfigService: any;
  let redisInstance: any;

  beforeEach(async () => {
    // Mock the TypeORM Repository
    mockUsageRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    // Mock ConfigService
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'AI_LIMIT_PRACTICE_GUEST') return 2;
        if (key === 'AI_LIMIT_PRACTICE_USER') return 6;
        if (key === 'REDIS_HOST') return 'localhost';
        if (key === 'REDIS_PORT') return 6379;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitAiService,
        {
          provide: getRepositoryToken(UsageLimitAi),
          useValue: mockUsageRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UsageLimitAiService>(UsageLimitAiService);

    // Call onModuleInit to trigger the mocked Redis initialization
    service.onModuleInit();

    // Extract the instantiated mocked Redis client
    const RedisMock = (Redis as unknown as jest.Mock);
    redisInstance = RedisMock.mock.results[0].value;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAndRecordUsage (Happy Paths)', () => {
    it('should allow a guest user to use AI and record usage successfully', async () => {
      // Arrange
      redisInstance.zcard.mockResolvedValue(0); // 0 usage so far
      mockUsageRepository.save.mockResolvedValue({ id: 'uuid-123' });

      // Act
      const result = await service.checkAndRecordUsage(
        undefined, // userId
        'visitor-123', // visitorId
        '192.168.1.1', // ip
        UsageAction.PRACTICE_ESSAY
      );

      // Assert
      expect(redisInstance.zcard).toHaveBeenCalled();
      expect(mockUsageRepository.save).toHaveBeenCalled();
      expect(redisInstance.zadd).toHaveBeenCalled();
      expect(result).toEqual({
        limit: 2,
        used: 1,
        remaining: 1,
        usageRecordId: 'uuid-123',
      });
    });
  });

  describe('checkAndRecordUsage (Sad Paths & Edge Cases)', () => {
    it('should throw HttpException(429) when usage limit is exceeded', async () => {
      // Arrange
      redisInstance.zcard.mockResolvedValue(2); // Limit for guest is 2, currently at 2

      // Act & Assert
      await expect(
        service.checkAndRecordUsage(
          undefined,
          'visitor-123',
          '192.168.1.1',
          UsageAction.PRACTICE_ESSAY
        )
      ).rejects.toThrow(HttpException);

      // Verify DB and ZADD were not called to prevent spam DB writes
      expect(mockUsageRepository.save).not.toHaveBeenCalled();
      expect(redisInstance.zadd).not.toHaveBeenCalled();
    });

    it('should bypass all limits and Redis checks if userRole is admin', async () => {
      // Arrange
      mockUsageRepository.save.mockResolvedValue({ id: 'admin-usage-uuid' });

      // Act
      const result = await service.checkAndRecordUsage(
        'admin-user-id',
        undefined,
        '192.168.1.1',
        UsageAction.PRACTICE_ESSAY,
        'admin' // userRole
      );

      // Assert
      expect(redisInstance.zcard).not.toHaveBeenCalled(); // Redis is skipped
      expect(result).toEqual({
        limit: 999,
        used: 0,
        remaining: 999,
        usageRecordId: 'admin-usage-uuid',
      });
    });
  });

  describe('refundUsage', () => {
    it('should rollback Redis counter and delete DB record successfully', async () => {
      // Arrange
      const usageRecordId = 'uuid-to-refund';
      mockUsageRepository.findOne.mockResolvedValue({
        id: usageRecordId,
        visitorId: 'visitor-123',
        action: UsageAction.PRACTICE_ESSAY,
      });

      // Act
      await service.refundUsage(usageRecordId);

      // Assert
      // Verify Redis rollback
      expect(redisInstance.zrem).toHaveBeenCalledWith(
        `rate_limit:${UsageAction.PRACTICE_ESSAY}:visitor_visitor-123`,
        usageRecordId
      );
      // Verify DB rollback
      expect(mockUsageRepository.delete).toHaveBeenCalledWith(usageRecordId);
    });
  });
});
