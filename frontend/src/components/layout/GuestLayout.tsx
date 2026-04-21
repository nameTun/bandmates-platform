import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { authService } from '@/features/auth/services/auth.service';

/**
 * Layout cho Guest (Premium Edition): Floating Navbar + Aurora Effects + Modern Footer
 */
const GuestLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Đảm bảo mỗi khi đổi trang, React tự động cuộn lên đỉnh màn hình
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) { console.error(e); }
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/practice', label: 'Luyện viết' },
    { to: '/vocabulary', label: 'Từ vựng' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfd] font-[Inter,sans-serif] text-slate-900 selection:bg-indigo-500/30 selection:text-indigo-900">

      {/* ── NAVBAR (Floating Glassmorphism) ── */}
      <div className="fixed top-1 sm:top-2.5 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
        <nav className="max-w-6xl mx-auto h-16 sm:h-20 bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/5 rounded-[24px] sm:rounded-[32px] flex items-center justify-between px-4 sm:px-8 pointer-events-auto relative overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 hover:border-indigo-200">

          {/* Opaque colorful hover state (Removes the whitish sink feeling) */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-20" />
          
          {/* Dynamic Glowing Aurora Edge */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 animate-aurora bg-[length:200%_100%] transition-opacity duration-700 -z-10 mix-blend-multiply" />
          
          {/* Volumetric Bottom Lighting */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />

          {/* Logo with Glow */}
          <Link to="/" className="flex items-center hover:scale-105 active:scale-95 transition-all duration-300 relative group/logo">
            <div className="absolute inset-x-0 bottom-0 h-4 bg-indigo-500/20 blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity" />
            <img src="/BandMates.svg" alt="BandMates Logo" className="h-28 sm:h-36 w-auto object-contain relative transition-all" />
          </Link>

          {/* Nav Links (Floating Capsule) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/40 p-1.5 rounded-full border border-slate-200/20 shadow-inner group/nav">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 overflow-hidden ${location.pathname === link.to
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                {location.pathname === link.to && (
                  <span className="absolute inset-0 bg-white shadow-sm rounded-full -z-10 animate-in fade-in zoom-in duration-500" />
                )}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-white/80 border border-slate-200/50 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group/user">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/20 group-hover/user:rotate-12 transition-transform">
                    {user.profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-slate-800 hidden sm:inline tracking-tight">{user.profile?.displayName || 'Tài khoản'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-110"
                  title="Đăng xuất"
                >
                  <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 rounded-2xl transition-all hover:bg-indigo-50/50">
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="group relative px-6 py-3 bg-slate-900 text-white text-sm font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-indigo-500/30 hover:bg-indigo-600 active:scale-95 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-25deg] -translate-x-[150%] group-hover:animate-shine" />
                  <span className="relative flex items-center gap-2">
                    Bắt đầu ngay
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col pt-24 sm:pt-32 pb-12 relative overflow-clip">
        {/* Subtle Background Decoration */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-violet-500/3 blur-[150px] rounded-full -z-10" />

        <Outlet />
      </main>

      {/* ── FOOTER (Premium Dark Glass) ── */}
      <footer className="relative bg-[#020617] text-slate-400 mt-auto border-t border-white/5 overflow-hidden">
        {/* Ambient Footer Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-16">

            {/* Brand Section */}
            <div className="lg:col-span-5 pr-0 lg:pr-8">
              <div className="flex items-center gap-3 mb-8 group/footer-logo cursor-default">
                <div className="relative w-12 h-12 rounded-[1.25rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg group-hover/footer-logo:shadow-indigo-500/20 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 opacity-0 group-hover/footer-logo:opacity-100 transition-opacity" />
                  <svg className="w-6 h-6 text-indigo-400 group-hover/footer-logo:scale-110 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <span className="text-3xl font-black text-white tracking-tighter italic drop-shadow-sm">
                  Band<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 not-italic">Mates</span>
                </span>
              </div>
              <p className="text-base text-slate-400 leading-relaxed max-w-md mb-10 font-medium group-hover/footer-logo:text-slate-300 transition-colors">
                Sứ mệnh của chúng tôi là xóa bỏ mọi rào cản ngôn ngữ bằng sức mạnh của AI. Nền tảng phân tích IELTS chuyên sâu giúp bạn chạm đến Band Score mơ ước.
              </p>

              {/* Premium Social Links */}
              <div className="flex gap-4">
                {[
                  { id: 'fb', href: '#', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
                  { id: 'gh', href: 'https://github.com/nameTun', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg> },
                  { id: 'mail', href: 'mailto:tuanktvn2001@gmail.com', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> }
                ].map(social => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/social relative w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-12 mt-10 lg:mt-0">
              {[
                { title: 'Nền tảng', links: ['Luyện viết AI', 'Kho từ vựng', 'Lịch sử học tập', 'Cộng đồng IELTS'] },
                { title: 'Hỗ trợ', links: ['Tài liệu hướng dẫn', 'Tham gia thảo luận', 'Liên hệ Support', 'Báo lỗi hệ thống'] },
                { title: 'Công ty', links: ['Website giới thiệu', 'Điều khoản dịch vụ', 'Chính sách bảo mật', 'Quản lý Cookies'] },
              ].map(section => (
                <div key={section.title}>
                  <h4 className="text-white text-[11px] font-black uppercase tracking-[0.25em] mb-8 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                    {section.title}
                  </h4>
                  <ul className="space-y-4">
                    {section.links.map(item => (
                      <li key={item}>
                        <a href="#" className="group flex items-center gap-3 text-[14px] text-slate-400 hover:text-indigo-200 transition-colors">
                          <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-indigo-400 group-hover:scale-150 transition-all duration-300" /> 
                          <span className="group-hover:translate-x-1.5 transition-transform duration-300">{item}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center lg:text-left">© 2026 BandMates AI . All rights reserved.</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 bg-white/[0.03] rounded-full border border-white/5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                System Status: <span className="text-emerald-400">Online</span>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 bg-white/[0.03] rounded-full border border-white/5 backdrop-blur-md">
                Built with <span className="text-rose-500 inline-block animate-bounce mx-1">❤️</span> for <span className="text-white">IELTS learners</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default GuestLayout;
