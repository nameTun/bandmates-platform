import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from './store/useAuthStore';
import LoginPage from './pages/LoginPage';
import ScoringPage from './pages/ScoringPage';
import api from './services/api';

const { Header, Content, Footer } = Layout;

const AppHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Gọi API logout để xóa Cookie bên backend
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Logout error", e);
    }
    logout(); // Xóa state frontend
    navigate('/');
  };

  const menuItems = [
    { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogout }
  ];

  return (
    <Header className="flex items-center justify-between px-8 bg-white shadow-sm border-b z-10">
      <div className="flex items-center font-bold text-xl tracking-tight text-blue-600">
        <Link to="/" className='text-blue-600 hover:text-blue-500'>BandMates</Link>
      </div>

      <div>
        {isAuthenticated && user ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-md transition">
              <Avatar src={undefined} icon={<UserOutlined />} className="bg-blue-500" />
              <span className="font-medium text-gray-700 hidden md:inline">{user.name || user.email}</span>
            </div>
          </Dropdown>
        ) : (
          <Link to="/login">
            <Button type="primary" icon={<LoginOutlined />}>Login</Button>
          </Link>
        )}
      </div>
    </Header>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout className="min-h-screen">
        <AppHeader />
        <Content className="bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ScoringPage />} />
          </Routes>
        </Content>
        <Footer className="text-center text-gray-500 bg-gray-50">
          BandMates AI ©2024 Created for Portfolio
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;
