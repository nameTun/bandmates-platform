import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface AdminRouteProps {
  redirectPath?: string;
}

/**
 * AdminRoute - Component bảo vệ chỉ dành cho quản trị viên.
 * Kiểm tra cả trạng thái đăng nhập và Role của User.
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ redirectPath = '/login' }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || user?.role !== 'admin') {
    // Nếu không phải Admin, redirect về trang login hoặc trang chủ
    console.warn('Truy cập trái phép vào khu vực Admin! Redirecting...');
    return <Navigate to={redirectPath} replace />;
  }

  // Nếu là Admin, cho phép truy cập vào các route con (Outlet)
  return <Outlet />;
};

export default AdminRoute;
