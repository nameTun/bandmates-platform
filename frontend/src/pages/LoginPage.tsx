import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { Button, Card, Typography, Spin, notification } from 'antd';
import { GoogleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuth, isAuthenticated } = useAuthStore();

    useEffect(() => {
        const status = searchParams.get('status');

        // Nếu login thành công từ Google (redirect về với status=success)
        if (status === 'success') {
            const initAuth = async () => {
                try {
                    // Gọi refresh để lấy Access Token đầu tiên từ Cookie
                    const { data } = await api.post('/auth/refresh');
                    setAuth(data.accessToken);
                    notification.success({ message: 'Login Success', description: 'Welcome back!' });
                    navigate('/');
                } catch (error) {
                    console.error("Initial refresh failed", error);
                    notification.error({ message: 'Login Failed', description: 'Could not retrieve session.' });
                    navigate('/login');
                }
            };
            initAuth();
        } else if (isAuthenticated) {
            navigate('/');
        }
    }, [searchParams, setAuth, navigate, isAuthenticated]);

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google`;
    };

    if (searchParams.get('status') === 'success') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md shadow-lg text-center p-8">
                <Title level={2} className="mb-2">Welcome Back</Title>
                <Text type="secondary" className="mb-8 block">
                    Sign in to access unlimited AI scoring check.
                </Text>

                <Button
                    type="primary"
                    size="large"
                    icon={<GoogleOutlined />}
                    onClick={handleGoogleLogin}
                    className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700"
                >
                    Sign in with Google
                </Button>

                <div className="mt-6">
                    <Text type="secondary" className="text-xs">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
