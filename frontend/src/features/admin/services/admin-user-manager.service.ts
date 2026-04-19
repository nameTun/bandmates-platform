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

export const adminUserService = {
    getUsers: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
    }) => {
        const response = await api.get<UserListResponse>('/admin/users', { params });
        return response.data;
    },

    updateRole: async (id: string, role: UserRole) => {
        const response = await api.patch(`/admin/users/${id}/role`, { role });
        return response.data;
    },

    updateStatus: async (id: string, isActive: boolean) => {
        const response = await api.patch(`/admin/users/${id}/status`, { isActive });
        return response.data;
    },
};
