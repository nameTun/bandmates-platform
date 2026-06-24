import { Test, TestingModule } from '@nestjs/testing';
import { PracticeService } from './practice.service';
import { AiService } from '../ai/ai.service';
import { ScoringCriteriaService } from '../scoring-criteria/scoring-criteria.service';
import { TaskType } from '../../common/enums/task-type.enum';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';

describe('PracticeService', () => {
  let service: PracticeService;
  let mockAiService: any;
  let mockCriteriaService: any;

  beforeEach(async () => {
    mockAiService = {
      generateWithFallback: jest.fn(),
    };

    mockCriteriaService = {
      findByTaskType: jest.fn().mockResolvedValue({
        TA: 'Task Achievement guidelines...',
        CC: 'Coherence and Cohesion guidelines...',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PracticeService,
        { provide: AiService, useValue: mockAiService },
        { provide: ScoringCriteriaService, useValue: mockCriteriaService },
      ],
    }).compile();

    service = module.get<PracticeService>(PracticeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkEnglish', () => {
    it('should generate personalized prompt for a user with profile and call AiService', async () => {
      // Arrange
      const userProfile = {
        id: 'prof-1',
        displayName: 'John',
        targetBand: '6.5',
        weakestSkill: ['Grammar', 'Vocabulary'],
      } as unknown as UserProfile;

      mockAiService.generateWithFallback.mockResolvedValue({ overallScore: 7.5 });

      // Act
      const result = await service.checkEnglish('My essay text', 'Topic prompt', userProfile, TaskType.TASK_2);

      // Assert
      expect(mockCriteriaService.findByTaskType).toHaveBeenCalledWith(TaskType.TASK_2);
      expect(mockAiService.generateWithFallback).toHaveBeenCalled();
      
      // Verify that the prompt construction included the target band + 1 (7.5)
      const callArgs = mockAiService.generateWithFallback.mock.calls[0];
      const userPromptPassedToAI = callArgs[0];
      
      expect(userPromptPassedToAI).toContain('John');
      expect(userPromptPassedToAI).toContain('Band 7.5'); // Target + 1
      expect(userPromptPassedToAI).toContain('Grammar, Vocabulary');
      expect(result).toEqual({ overallScore: 7.5 });
    });

    it('should generate default prompt for a guest user (no profile) and call AiService', async () => {
      // Arrange
      mockAiService.generateWithFallback.mockResolvedValue({ overallScore: 8.0 });

      // Act
      const result = await service.checkEnglish('Guest essay text');

      // Assert
      expect(mockCriteriaService.findByTaskType).toHaveBeenCalledWith(TaskType.TASK_2);
      expect(mockAiService.generateWithFallback).toHaveBeenCalled();
      
      const callArgs = mockAiService.generateWithFallback.mock.calls[0];
      const userPromptPassedToAI = callArgs[0];
      
      // Default target band for guest is 7.0, so AI target is 8.0
      expect(userPromptPassedToAI).toContain('Band 8'); 
      expect(result).toEqual({ overallScore: 8.0 });
    });
  });
});
