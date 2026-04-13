import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import OnboardingModal from '@/features/user-profiles/components/OnboardingModal';
import { useProfileStore } from '@/features/user-profiles/store/useProfileStore';

/**
 * Layout cho User đã đăng nhập: Sidebar trái + Content phải
 * Dùng <Outlet /> để react-router render child route vào vùng content
 */
const AuthenticatedLayout: React.FC = () => {
  const { fetchProfile, isInitialized } = useProfileStore();

  useEffect(() => {
    // Gọi API lấy dữ liệu khảo sát 1 lần duy nhất khi render Layout
    if (!isInitialized) {
      fetchProfile();
    }
  }, [fetchProfile, isInitialized]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <Outlet />
        {/* Onboarding Modal tự động quyết định ẩn/hiện dựa vào store */}
        <OnboardingModal />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
