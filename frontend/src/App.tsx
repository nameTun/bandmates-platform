import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Layout, Spin } from 'antd';
import { UserOutlined, LogoutOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ScoringPage from '@/features/scoring/pages/ScoringPage';
import { AuthService } from '@/features/auth/services/auth.service';
import { useAuth } from './features/auth/hooks/useAuth';

const { Footer } = Layout;

const AppHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      console.error("Logout error", e);
    }
    logout();
    navigate('/');
  };

  const menuItems = [
    { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout }
  ];

  return (
    <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-outline">
      <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src="/BandMates.svg" alt="BandMates Logo" className="h-40 w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated && user ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-surface-variant px-3 py-1.5 rounded-xl transition-colors border border-transparent hover:border-outline">
                <Avatar src={undefined} icon={<UserOutlined />} className="bg-primary flex items-center justify-center" />
                <span className="font-semibold text-sm text-on-surface hidden md:inline">{user.name}</span>
              </div>
            </Dropdown>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-md shadow-primary/20 hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  // Tách logic khởi tạo auth ra hook riêng, App chỉ lo Layout & Routing
  const { isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
      </div>
    );
  }

  return (
    <Router>
      <Layout className="flex flex-col bg-background font-body text-on-background" style={{ minHeight: '100vh' }}>
        <AppHeader />
        <main className="flex-1 flex flex-col">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ScoringPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer className="w-full bg-surface border-t border-outline mt-auto !py-4 px-0">
          <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-4 max-w-7xl mx-auto">
            <div className="flex items-center">
              <img src="/BandMates.svg" alt="BandMates Logo" className="h-8 w-auto object-contain opacity-80" />
            </div>
            <div className="flex gap-6">
              <a className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="#">Terms</a>
              <a className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="#">Privacy</a>
              <a className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="#">Contact</a>
              <a className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="#">Support</a>
            </div>
            <div className="text-sm font-medium text-secondary">© 2025 BandMates AI. All rights reserved.</div>
          </div>
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;
