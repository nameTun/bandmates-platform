import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from './features/auth/store/useAuthStore';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ScoringPage from './features/scoring/pages/ScoringPage';
import api from './lib/api';

const AppHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
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
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-on-background hover:opacity-80 transition-opacity">
          <Sparkles size={22} className="text-primary fill-primary/20" />
          <span>BandMates AI</span>
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated && user ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-surface-variant px-3 py-1.5 rounded-xl transition-colors border border-transparent hover:border-outline">
                <Avatar src={undefined} icon={<UserOutlined />} className="bg-primary flex items-center justify-center" />
                <span className="font-semibold text-sm text-on-surface hidden md:inline">{user.name || user.email}</span>
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
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background font-body text-on-background">
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
        <footer className="w-full py-8 md:py-12 bg-surface border-t border-outline mt-auto">
            <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-4 max-w-7xl mx-auto">
                <div className="font-bold text-on-background flex items-center gap-2">
                    <Sparkles size={16} className="text-primary" /> BandMates AI
                </div>
                <div className="flex gap-6">
                    <a className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="#">Terms</a>
                    <a className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="#">Privacy</a>
                    <a className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="#">Contact</a>
                    <a className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="#">Support</a>
                </div>
                <div className="text-sm font-medium text-secondary">© 2024 BandMates AI. All rights reserved.</div>
            </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
