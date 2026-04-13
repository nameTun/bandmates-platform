import api from '@/lib/api';

import { ExamType, WritingFocus, StudyPurpose } from '@/common/enums/user-profile.enum';

export interface UserProfile {
    id: string;
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
    currentBand: number | null;
    targetBand: number | null;
    targetDate: string | null;
    examType: ExamType | null;
    weakestSkill: WritingFocus | null;
    studyPurpose: StudyPurpose | null;
    isOnboardingCompleted: boolean;
}

export interface UpdateUserProfileDto {
    displayName?: string;
    currentBand?: number;
    targetBand?: number;
    targetDate?: string;
    examType?: ExamType;
    weakestSkill?: WritingFocus;
    studyPurpose?: StudyPurpose;
}

export const userProfilesService = {
    getMe: async (): Promise<{ success: boolean; data: UserProfile }> => {
        const response = await api.get('/user-profiles/me');
        return response.data;
    },
    
    completeOnboarding: async (data: UpdateUserProfileDto): Promise<{ success: boolean; data: UserProfile; message: string }> => {
        const response = await api.post('/user-profiles/onboarding', data);
        return response.data;
    }
};
