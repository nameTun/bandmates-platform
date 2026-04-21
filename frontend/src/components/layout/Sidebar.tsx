import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProfileStore } from '@/features/user-profiles/store/useProfileStore';
import { authService } from '@/features/auth/services/auth.service';

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    to: '/practice',
    label: 'Luyện viết',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    to: '/vocabulary',
    label: 'Từ vựng',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'Lịch sử',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { profile } = useProfileStore();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try { await authService.logout(); } catch (e) { console.error(e); }
    logout();
    navigate('/');
  };

  const displayName = profile?.displayName || user?.profile?.displayName || 'User';

  return (
    <aside className={`relative bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 transition-all duration-300 ease-in-out z-[100] ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-5 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-md z-50 transition-colors"
      >
        <svg className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Top: Logo + Nav */}
      <div className="overflow-visible">
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-slate-100 transition-all duration-300 ${isCollapsed ? 'px-0 justify-center' : 'px-5'}`}>
          <NavLink to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex flex-shrink-0 items-center justify-center shadow-md shadow-indigo-200">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <h1 className="text-base font-extrabold text-slate-900 leading-none tracking-tight">BandMates</h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">AI Writing Coach</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3 mt-1">
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={`relative flex items-center gap-3 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white shadow-lg shadow-slate-200 mb-4 hover:bg-slate-800 transition-all group overflow-visible ${isCollapsed ? 'px-0 justify-center' : 'px-3'}`}
            >
              <span className="text-orange-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>Quản trị hệ thống</span>
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap transform group-hover:translate-x-1">
                  Quản trị hệ thống
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45 rounded-sm" />
                </div>
              )}
            </NavLink>
          )}

          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-visible ${
                  isCollapsed ? 'px-0 justify-center' : 'px-3'
                } ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-colors ${isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </span>
                  <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>{item.label}</span>
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap transform group-hover:translate-x-1">
                      {item.label}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45 rounded-sm" />
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom: User info + Settings + Logout */}
      <div className="p-3 border-t border-slate-100 overflow-visible">
        {/* User info */}
        {user && (
          <div className={`relative group flex items-center gap-3 py-2.5 mb-2 transition-all duration-300 ${isCollapsed ? 'px-0 justify-center' : 'px-3'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 cursor-pointer">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className={`transition-all duration-300 min-w-0 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
              <p className="text-sm font-semibold text-slate-800 truncate leading-none mb-1">{displayName}</p>
              <p className="text-[11px] text-slate-400 truncate leading-none">{user.email}</p>
            </div>
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap transform group-hover:translate-x-1">
                {user.email}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45 rounded-sm" />
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        <button className={`relative flex items-center gap-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all group overflow-visible ${isCollapsed ? 'px-0 justify-center' : 'px-3'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>Cài đặt</span>
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap transform group-hover:translate-x-1">
              Cài đặt
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-2.5 bg-slate-800 rotate-45 rounded-sm" />
            </div>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`relative flex items-center gap-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all mt-1 group overflow-visible ${isCollapsed ? 'px-0 justify-center' : 'px-3'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'hidden opacity-0' : 'block opacity-100'}`}>Đăng xuất</span>
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-red-400 text-xs font-bold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] whitespace-nowrap transform group-hover:translate-x-1">
              Đăng xuất
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45 rounded-sm" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
