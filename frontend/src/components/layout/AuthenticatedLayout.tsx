import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Layout cho User đã đăng nhập: Sidebar trái + Content phải
 * Dùng <Outlet /> để react-router render child route vào vùng content
 */
const AuthenticatedLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
