import { useState, useEffect } from 'react';
import { authService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

/**
 * Hook khởi tạo Auth - chạy 1 lần duy nhất khi app mount.
 * Nhiệm vụ: Kiểm tra Cookie refreshToken còn hạn không.
 *   - Còn hạn  → gọi /auth/refresh → khôi phục session vào Zustand
 *   - Hết hạn  → bỏ qua, để Guest mode
 * 
 * Trả về isLoading để App biết khi nào cần hiển thị màn hình loading.
 */
export const useAuth = () => {
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const data = await authService.refresh();
                if (data?.accessToken && data?.user) {
                    setAuth(data.accessToken, data.user);
                }
            } catch {
                // Cookie hết hạn hoặc chưa login → bỏ qua
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, [setAuth]);

    return { isLoading };
};
