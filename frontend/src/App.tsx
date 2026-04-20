import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import PracticePage from '@/features/practice/pages/PracticePage';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import VocabularyPage from '@/features/vocabulary/pages/VocabularyPage';
import HistoryPage from '@/features/history/pages/HistoryPage';
import GuestLayout from '@/components/layout/GuestLayout';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import AdminRoute from '@/features/auth/components/AdminRoute';

/* ── Admin Pages (Lazy Loaded) ── */
// Lazy giúp tối ưu hóa hiệu năng, chỉ tải khi cần thiết, nếu route /admin thì mới load code admin
const AdminLayout = lazy(() => import('@/features/admin/components/AdminLayout'));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'));
const PromptManagement = lazy(() => import('@/features/admin/pages/PromptManagement'));
const CategoryManagement = lazy(() => import('@/features/admin/pages/CategoryManagement'));
const CriteriaManagement = lazy(() => import('@/features/admin/pages/CriteriaManagement'));
const UserManagement = lazy(() => import('@/features/admin/pages/UserManagement'));
/**
 * SmartRedirect - Chuyển hướng người dùng dựa trên vai trò (Role)
 */
const SmartRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return user?.role === 'admin' 
    ? <Navigate to="/admin" replace /> 
    : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  const { isLoading } = useAuth();
  const { isAuthenticated } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#4f46e5' }} spin />} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>

        {/* ── 1. Routes chung (Cả Guest và User ) ── */}
        <Route element={isAuthenticated ? <AuthenticatedLayout /> : <GuestLayout />}>
          <Route path="/" element={isAuthenticated ? <SmartRedirect /> : <HomePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <SmartRedirect /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <SmartRedirect /> : <RegisterPage />} 
          />
        </Route>

        {/* ── 2. Routes riêng cho User đã đăng nhập  ── */}
        {isAuthenticated && (
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:id" element={<PracticePage />} />
          </Route>
        )}

        {/* ── 3. Routes riêng cho Admin ── */}
        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-950"><Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#f97316' }} spin />} /></div>}>
                <AdminLayout />
              </Suspense>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="prompts" element={<PromptManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="criteria" element={<CriteriaManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Route>

        {/* Fallback Catch-all */}
        <Route path="*" element={<SmartRedirect />} />
      </Routes>
    </Router>
  );
};

export default App;
