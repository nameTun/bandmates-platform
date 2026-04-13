import { ExamType } from '../../users/entities/user-profile.entity';

export class UpdateUserProfileDto {
    displayName?: string;
    currentBand?: number;
    targetBand?: number;
    targetDate?: Date;
    examType?: ExamType;
    weakestSkill?: string;
    studyPurpose?: string;
}
