import api from '@/lib/api';
import { UserRole } from '@/common/enums/user-role.enum';

export interface AdminUser {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    googleId: string | null;
    facebookId: string | null;
    createdAt: string;
    profile: {
        displayName: string;
        avatarUrl: string | null;
    };
    totalEssays: number;
    avgBand: number;
}

export interface UserListResponse {
    items: AdminUser[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}

export interface UserStatsResponse {
    today: number;
    month: number;
    year: number;
}

export const adminUserManagerService = {
    getUsers: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        provider?: string;
    }): Promise<UserListResponse> => {
        const response = await api.get<UserListResponse>('/admin/users', { params });
        return response.data;
    },

    getStats: async (): Promise<UserStatsResponse> => {
        const response = await api.get<UserStatsResponse>('/admin/users/stats');
        return response.data;
    },

    updateRole: async (id: string, role: UserRole): Promise<AdminUser> => {
        const response = await api.patch(`/admin/users/${id}/role`, { role });
        return response.data;
    },

    updateStatus: async (id: string, isActive: boolean): Promise<AdminUser> => {
        const response = await api.patch(`/admin/users/${id}/active`, { isActive });
        return response.data;
    },
};
