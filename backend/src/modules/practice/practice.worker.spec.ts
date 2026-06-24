import { Test, TestingModule } from '@nestjs/testing';
import { PracticeWorker } from './practice.worker';
import { PracticeService } from './practice.service';
import { UsageLimitAiService } from '../usage-limit-ai/usage-limit-ai.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('PracticeWorker', () => {
  let worker: PracticeWorker;
  let mockPracticeService: any;
  let mockUsageLimitService: any;
  let mockAttemptRepository: any;
  let mockCacheManager: any;

  beforeEach(async () => {
    // Mock the PracticeService (AI Wrapper)
    mockPracticeService = {
      checkEnglish: jest.fn(),
    };

    // Mock UsageLimitAiService (For refunding)
    mockUsageLimitService = {
      refundUsage: jest.fn(),
    };

    // Mock TypeORM Repository
    mockAttemptRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    // Mock Cache Manager (Redis)
    mockCacheManager = {
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PracticeWorker],
      providers: [
        { provide: PracticeService, useValue: mockPracticeService },
        { provide: UsageLimitAiService, useValue: mockUsageLimitService },
        {
          provide: getRepositoryToken(PracticeAttempt),
          useValue: mockAttemptRepository,
        },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    worker = module.get<PracticeWorker>(PracticeWorker);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleEvaluateEssay', () => {
    const mockData = {
      submissionId: 'sub-123',
      text: 'Hello world',
      promptContent: 'Test prompt',
      userProfile: null,
      taskType: 'IELTS',
      usageRecordId: 'usage-123',
    };

    let mockChannel: any;
    let mockContext: any;
    let mockOriginalMsg: any;

    beforeEach(() => {
      // Mock RabbitMQ Channel
      mockChannel = {
        ack: jest.fn(),
        assertQueue: jest.fn().mockResolvedValue(true),
        sendToQueue: jest.fn(),
      };

      // Mock RabbitMQ Original Message
      mockOriginalMsg = { content: Buffer.from('test') };

      // Mock RmqContext
      mockContext = {
        getChannelRef: jest.fn().mockReturnValue(mockChannel),
        getMessage: jest.fn().mockReturnValue(mockOriginalMsg),
      };
    });

    it('should process message successfully, update DB, set COMPLETED cache, and ack', async () => {
      // Arrange
      const aiResult = { overallScore: 7.0, scoreTA: 7, scoreCC: 7, scoreLR: 7, scoreGRA: 7 };
      mockPracticeService.checkEnglish.mockResolvedValue(aiResult);
      
      const mockAttempt = { id: 'sub-123', status: 'processing' };
      mockAttemptRepository.findOne.mockResolvedValue(mockAttempt);

      // Act
      await worker.handleEvaluateEssay(mockData, mockContext);

      // Assert
      expect(mockCacheManager.set).toHaveBeenCalledWith(`submission:sub-123`, { status: 'PROCESSING', result: null }, 3600000);
      expect(mockPracticeService.checkEnglish).toHaveBeenCalledWith(
        mockData.text,
        mockData.promptContent,
        mockData.userProfile,
        mockData.taskType
      );
      expect(mockAttemptRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        status: 'success',
        aiResponse: aiResult,
        overallScore: 7.0,
      }));
      expect(mockCacheManager.set).toHaveBeenCalledWith(`submission:sub-123`, { status: 'COMPLETED', result: aiResult }, 3600000);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockOriginalMsg);
    });

    it('should retry on failure and eventually push to DLQ, refund usage, and ack after max retries', async () => {
      // Arrange
      mockPracticeService.checkEnglish.mockRejectedValue(new Error('AI timeout'));
      
      const mockAttempt = { id: 'sub-123', status: 'processing' };
      mockAttemptRepository.findOne.mockResolvedValue(mockAttempt);

      // Bypass the 5000ms timeout by making setTimeout execute immediately
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => cb() as any);

      // Act
      await worker.handleEvaluateEssay(mockData, mockContext);

      // Assert
      expect(mockPracticeService.checkEnglish).toHaveBeenCalledTimes(3); // Max retries
      expect(mockAttemptRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }));
      expect(mockCacheManager.set).toHaveBeenCalledWith(`submission:sub-123`, { status: 'FAILED', result: null }, 3600000);
      expect(mockUsageLimitService.refundUsage).toHaveBeenCalledWith('usage-123');
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('practice_dlq', { durable: true });
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith('practice_dlq', mockOriginalMsg.content);
      expect(mockChannel.ack).toHaveBeenCalledWith(mockOriginalMsg);

      setTimeoutSpy.mockRestore();
    });
  });
});
