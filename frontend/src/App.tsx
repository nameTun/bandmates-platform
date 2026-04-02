import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ScoringPage from '@/features/scoring/pages/ScoringPage';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import VocabularyPage from '@/features/vocabulary/pages/VocabularyPage';
import HistoryPage from '@/features/history/pages/HistoryPage';
import GuestLayout from '@/components/layout/GuestLayout';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * App Root — Dual Layout Routing
 *
 * Guest:         GuestLayout (Navbar + Footer)  → HomePage, Login, Register, Practice, Vocabulary
 * Authenticated: AuthenticatedLayout (Sidebar)  → Practice, Vocabulary, History
 *
 * Trang /practice và /vocabulary cho phép cả Guest và Auth truy cập,
 * nhưng hiển thị layout khác nhau tùy trạng thái đăng nhập.
 */
const App: React.FC = () => {
  const { isRestoring } = useAuth();
  const { isAuthenticated } = useAuthStore();

  if (isRestoring) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#4f46e5' }} spin />} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          /* ── Authenticated: Sidebar Layout ── */
          <>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/practice" element={<ScoringPage />} />
              <Route path="/vocabulary" element={<VocabularyPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>
            {/* Redirect auth pages to dashboard khi đã login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          /* ── Guest: Navbar + Footer Layout ── */
          <Route element={<GuestLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/practice" element={<ScoringPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default App;
