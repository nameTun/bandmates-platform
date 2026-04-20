import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'antd';
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
    (response) => {
        // Tự động "bóc vỏ" nếu response có cấu trúc Global Wrapper { success: true, data: ... }
        if (response.data && response.data.success === true && 'data' in response.data) {
            return {
                ...response,
                data: response.data.data
            };
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // Xử lý lỗi 401: Unauthorized (Access Token hết hạn)
            // CHỈ retry nếu:
            //   1. Chưa retry lần nào (_retry flag)
            //   2. KHÔNG phải request từ chính các endpoint Auth
            //      (login/register sai pass → 401 là đúng, đừng can thiệp!)
            const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh']
                .some(path => originalRequest.url?.includes(path));

            if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
                originalRequest._retry = true;

                try {
                    // Dùng axios thuần (KHÔNG dùng authService) để tránh Circular Dependency!
                    const rs = await axios.post(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );
                    const { accessToken, user } = rs.data.data; // Thêm .data để bóc vỏ vì gọi bằng axios thuần

                    // Cập nhật cả token lẫn user vào Store
                    useAuthStore.getState().setAuth(accessToken, user);

                    // Cập nhật header cho request cũ và retry
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (_error) {
                    // Refresh thất bại (token hết hạn hẳn) → Logout
                    useAuthStore.getState().logout();
                    return Promise.reject(_error);
                }
            }

            // Xử lý lỗi 429
            if (error.response.status === 429) {
                console.warn('Rate limit exceeded for Guest');
            }

            // XỬ LÝ LỖI TÀI KHOẢN BỊ KHÓA (BANNED)
            const errorMessage = error.response.data?.message || '';
            if (errorMessage.includes('Tài khoản của bạn đã bị khóa')) {
                // Hiển thị Modal thông báo chuyên nghiệp
                Modal.warning({
                    title: 'Tài khoản đã bị tạm khóa',
                    content: 'Chúng tôi nhận thấy tài khoản của bạn đang vi phạm một số chính sách của hệ thống hoặc đang được quản trị viên bảo trì. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.',
                    okText: 'Tôi đã hiểu',
                    centered: true,
                    maskClosable: false,
                    className: 'banned-modal',
                    onOk: () => {
                        useAuthStore.getState().logout();
                        window.location.href = '/login'; // Chuyển về trang login
                    }
                });
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
