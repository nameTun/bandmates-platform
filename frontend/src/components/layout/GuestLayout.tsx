import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { authService } from '@/features/auth/services/auth.service';

/**
 * Layout cho Guest: Navbar (top) + Content + Footer
 * Dùng <Outlet /> để react-router render child route vào vùng content
 */
const GuestLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { 
      await authService.logout(); 
    } catch (e) 
    { console.error(e); }
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/practice', label: 'Luyện viết' },
    { to: '/vocabulary', label: 'Từ vựng' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white font-[Inter,sans-serif] text-slate-900">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 w-full z-50 bg-white/75 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">

          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/BandMates.svg" alt="BandMates Logo" className="h-36 w-auto object-contain" />
          </Link>

          {/* Nav Links (center) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/70 rounded-xl p-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-indigo-600 bg-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-full pl-1 pr-4 py-1 hover:border-slate-300 transition-colors cursor-default">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 hidden sm:inline">{user.profile?.displayName || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Đăng xuất"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 rounded-lg transition-colors">
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="group relative px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md active:scale-[0.97] transition-all overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Bắt đầu ngay</span>
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* ── CONTENT ── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 text-slate-400 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <span className="text-lg font-extrabold text-white tracking-tight">
                  Band<span className="text-indigo-400">Mates</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500 mb-6">
                Nâng cao kỹ năng viết IELTS với AI Coach thông minh. Chấm điểm tức thì, phân tích lỗi chi tiết.
              </p>
              <div className="flex gap-3">
                {['facebook', 'github', 'mail'].map(social => (
                  <a key={social} href="#" className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-indigo-500/20 border border-slate-700/50 hover:border-indigo-500/30 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-all">
                    {social === 'facebook' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                    {social === 'github' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>}
                    {social === 'mail' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Sản phẩm</h4>
              <ul className="space-y-3">
                {['Chấm bài Writing', 'Tra cứu từ vựng', 'Lịch sử làm bài', 'Học theo chủ đề'].map(item => (
                  <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Hỗ trợ</h4>
              <ul className="space-y-3">
                {['Hướng dẫn sử dụng', 'Câu hỏi thường gặp', 'Liên hệ', 'Báo lỗi'].map(item => (
                  <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Pháp lý</h4>
              <ul className="space-y-3">
                {['Điều khoản sử dụng', 'Chính sách bảo mật', 'Cookie Policy'].map(item => (
                  <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} BandMates AI. All rights reserved.</p>
            <p className="text-xs text-slate-700">Built with <span className="text-red-400">♥</span> for IELTS learners</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default GuestLayout;
