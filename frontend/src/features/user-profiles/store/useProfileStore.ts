import { create } from 'zustand';
import type { UserProfile } from '../services/user-profiles.service';
import { userProfilesService } from '../services/user-profiles.service';
interface ProfileState {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    
    fetchProfile: () => Promise<void>;
    updateProfile: (profile: UserProfile) => void;
    clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
    profile: null,
    isLoading: false,
    error: null,
    isInitialized: false, // Dùng để theo dõi xem đã gọi API lần đầu chưa, tránh chớp nháy

    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await userProfilesService.getMe();
            set({ profile: data, isLoading: false, isInitialized: true });
        } catch (error: any) {
            set({ error: error.message, isLoading: false, isInitialized: true });
        }
    },

    updateProfile: (profile) => {
        set({ profile });
    },

    clearProfile: () => {
        set({ profile: null, isInitialized: false });
    }
}));
