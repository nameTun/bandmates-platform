import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

// Khởi tạo axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Quan trọng: Cho phép gửi/nhận Cookie (Refresh Token)
});

// Helper lấy hoặc tạo Visitor ID
const getVisitorId = () => {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = uuidv4();
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
};

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
    (config) => {
        // 1. Gắn Visitor ID
        config.headers['x-visitor-id'] = getVisitorId();

        // 2. Gắn Access Token từ Zustand Store
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // Xử lý lỗi 401: Unauthorized (Token hết hạn)
            // Chỉ retry nếu chưa retry lần nào (_retry flag)
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // Gọi API refresh token (Cookie sẽ tự động được gửi đi)
                    // Lưu ý: Dùng instance mới hoặc instance hiện tại nhưng cẩn thận loop
                    // Ở đây dùng chính api này vì endpoint refresh không yêu cầu Auth Header valid
                    const rs = await AuthService.refresh();

                    const { accessToken } = rs.data;

                    // Cập nhật token vào Store
                    useAuthStore.getState().setAuth(accessToken);

                    // Cập nhật header cho request cũ và retry
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (_error) {
                    // Refresh thất bại (Token hết hạn hẳn hoặc không hợp lệ) -> Logout
                    useAuthStore.getState().logout();
                    return Promise.reject(_error);
                }
            }

            // Xử lý lỗi 429
            if (error.response.status === 429) {
                console.warn('Rate limit exceeded for Guest');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
