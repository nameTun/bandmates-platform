import React, { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

/* ────────────────────────────────────────────────
   Reusable: Mouse-glow wrapper
   Theo dõi chuột và tạo hiệu ứng vùng sáng tỏa ra từ vị trí con trỏ
   ──────────────────────────────────────────────── */
const MouseGlow: React.FC<{
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
}> = ({ children, className = '', glowColor = 'rgba(99,102,241,0.15)', glowSize = 400 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => setPos({ x: -1000, y: -1000 }), []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* The glow circle that follows the cursor */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300"
        style={{
          left: pos.x,
          top: pos.y,
          width: glowSize,
          height: glowSize,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity: pos.x > -500 ? 1 : 0,
        }}
      />
      {children}
    </div>
  );
};

/* ────────────────────────────────────────────────
   Reusable: 3D tilt card (nghiêng theo hướng chuột)
   ──────────────────────────────────────────────── */
const TiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  tiltDeg?: number;
}> = ({ children, className = '', tiltDeg = 6 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateY(${x * tiltDeg}deg) rotateX(${-y * tiltDeg}deg) scale3d(1.02,1.02,1.02)`);
  }, [tiltDeg]);

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform, transition: 'transform 0.25s ease-out' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

/* ──────────── DATA ──────────── */

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    badge: 'Core Feature',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    title: 'IELTS Writing Scorer',
    description: 'Chấm điểm AI chuẩn xác kèm phân tích sâu từng tiêu chí chấm điểm. Hệ thống chỉ rõ lỗi sai, gợi ý sửa đổi và cung cấp phiên bản bài viết hoàn hảo theo Band điểm mục tiêu của bạn.',
    highlights: ['Phân tích tiêu chí chuẩn', 'Gợi ý nâng Band', 'Bài mẫu cá nhân hóa'],
    color: 'from-indigo-50 to-blue-50',
    border: 'border-indigo-200/70',
    iconBg: 'bg-indigo-500',
    shadow: 'shadow-indigo-100',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    badge: 'Smart Dictionary',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    title: 'Tra cứu từ vựng thông minh',
    description: 'Tra cứu thông minh tích hợp ví dụ Word Family đa dạng. Đột phá với tính năng gợi ý cấu trúc nâng Band điểm cá nhân hóa, giúp bạn nâng tầm văn phong học thuật tức thì.',
    highlights: ['Ví dụ Word Family', 'Cấu trúc nâng Band', 'Văn phong chuyên môn'],
    color: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200/70',
    iconBg: 'bg-emerald-500',
    shadow: 'shadow-emerald-100',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    badge: 'Progress Tracking',
    badgeColor: 'bg-amber-100 text-amber-700',
    title: 'Lịch sử & Theo dõi tiến độ',
    description: 'Xem lại toàn bộ bài đã nộp, so sánh điểm số qua các lần luyện tập, và ôn lại danh sách từ vựng đã tra cứu.',
    highlights: ['Lịch sử làm bài', 'Từ đã tra cứu', 'Biểu đồ tiến độ'],
    color: 'from-amber-50 to-orange-50',
    border: 'border-amber-200/70',
    iconBg: 'bg-amber-500',
    shadow: 'shadow-amber-100',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    badge: 'Coming Soon',
    badgeColor: 'bg-rose-100 text-rose-700',
    title: 'Tự nhập đề bài (Custom Prompt)',
    description: 'Cho phép người dùng tự động nhập và mô phỏng mọi loại đề bài (Cambridge, Actual Tests...). Trải nghiệm sự linh hoạt tuyệt đối mà không bị giới hạn bởi thư viện có sẵn. Đề của bạn nhưng được chấm bằng công thức chuẩn IELTS.',
    highlights: ['Nhập đề tự do', 'Chấm điểm độc lập', 'Thống kê thực tế'],
    color: 'from-rose-50 to-pink-50',
    border: 'border-rose-200/70',
    iconBg: 'bg-rose-500',
    shadow: 'shadow-rose-100',
    comingSoon: true,
  },
];

const steps = [
  {
    num: '01',
    title: 'Chọn dạng bài',
    desc: 'Task 1 hoặc Task 2, hệ thống tự điều chỉnh tiêu chí chấm điểm phù hợp.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Viết & Nộp bài',
    desc: 'Soạn thảo bài viết trong editor thông minh, đếm từ real-time, không giới hạn thời gian.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Nhận phân tích AI',
    desc: 'Band Score, lỗi sai có giải thích, gợi ý cải thiện xuất hiện ngay bên phải màn hình.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

const stats = [
  { value: '9.0', label: 'Band Score tối đa', sub: 'Chuẩn IELTS chính thức' },
  { value: '4', label: 'Tiêu chí chấm', sub: 'Task / Coherence / Lexical / Grammar' },
  { value: '∞', label: 'Từ vựng', sub: 'Không giới hạn tra cứu' },
];

/* ──────────── COMPONENT ──────────── */

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════ HERO (Premium Interactive) ═══════════════ */}
      <MouseGlow
        className="bg-[#020617] text-white overflow-hidden relative"
        glowColor="rgba(99, 102, 241, 0.2)"
        glowSize={1000}
      >
        {/* Dynamic Abstract Background with Reverse Parallax */}
        <TiltCard tiltDeg={-3} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/30 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-8 h-8 bg-indigo-400/40 rounded-full blur-md animate-float" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-[30%] left-[15%] w-12 h-12 bg-violet-400/30 rounded-full blur-lg animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }} />
          <div className="absolute top-[40%] left-[5%] w-3 h-3 bg-sky-400/60 rounded-full animate-ping" style={{ animationDuration: '4s' }} />

          {/* Subtle Grid with fade out mask */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
        </TiltCard>

        <TiltCard tiltDeg={6} className="relative z-10 max-w-5xl mx-auto px-6 py-32 md:py-48 text-center flex flex-col items-center justify-center min-h-[90vh]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/[0.03] border border-white/10 px-5 py-2 rounded-full mb-10 backdrop-blur-md shadow-2xl shadow-indigo-500/10 hover:bg-white/[0.08] hover:border-indigo-400/30 hover:-translate-y-1 transition-all duration-300 cursor-default group">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 group-hover:bg-indigo-400 transition-colors" />
            </span>
            <span className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors" style={{ textShadow: '0 0 10px rgba(129,140,248,0.3)' }}>
              AI-Powered IELTS Writing Coach
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold leading-[1.1] tracking-tighter mb-8 text-white drop-shadow-2xl">
            Chinh phục{' '}
            <span className="relative inline-block group">
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-aurora filter drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]">
                Band 8+
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-full opacity-50 group-hover:opacity-100 blur-[2px] group-hover:blur-[4px] transition-all duration-500" />
            </span>
            <br />
            <span className="opacity-90">với AI Writing Coach</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            Nộp bài viết IELTS và nhận phân tích chi tiết tức thì — <span className="text-indigo-300">Band Score</span>, lỗi sai có giải thích, gợi ý nâng điểm. <span className="text-white">Không cần chờ đợi giáo viên.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full sm:w-auto">
            {isAuthenticated ? (
              <Link
                to="/practice"
                className="group relative px-10 py-5 bg-white text-indigo-950 font-black text-lg rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:shadow-[0_0_60px_rgba(99,102,241,0.5)] transition-all active:scale-95 flex items-center gap-3 w-full sm:w-auto justify-center overflow-hidden"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-indigo-500/10 skew-x-[-25deg] -translate-x-[150%] group-hover:animate-shine" />
                <svg className="w-6 h-6 group-hover:rotate-12 group-hover:scale-110 transition-all text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="relative">Bắt đầu luyện tập</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group relative px-10 py-5 bg-white text-indigo-950 hover:bg-slate-50 font-black text-lg rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.2)] hover:shadow-[0_0_60px_rgba(99,102,241,0.4)] transition-all duration-300 active:scale-95 flex justify-center w-full sm:w-auto overflow-hidden"
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-indigo-500/10 skew-x-[-25deg] -translate-x-[150%] group-hover:animate-shine" />
                  <span className="relative flex items-center gap-2">
                    Đăng ký trải nghiệm
                    <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/practice"
                  className="px-10 py-5 bg-white/5 text-white font-bold text-lg rounded-2xl border border-white/10 hover:border-indigo-400/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md hover:shadow-2xl hover:shadow-indigo-500/20 flex justify-center w-full sm:w-auto"
                >
                  Thử ngay miễn phí
                </Link>
              </>
            )}
          </div>

          <p className="text-slate-500 text-sm mt-10 font-medium">
            Miễn phí 2 lần mỗi ngày chấm bài tự động không cần đăng nhập.
          </p>
        </TiltCard>
      </MouseGlow>

      {/* ═══════════════ STATS (Floating Premium Bar) ═══════════════ */}
      <section className="relative z-20 -mt-16 md:-mt-20 mb-20 px-6 pointer-events-none">
        <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] shadow-indigo-500/5 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-12 flex flex-col md:flex-row justify-between items-center gap-10 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200/60 pointer-events-auto transition-transform hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] hover:shadow-indigo-500/10 duration-500">
          {stats.map(s => (
            <div key={s.label} className="group w-full md:w-1/3 text-center px-6 hover:-translate-y-2 transition-transform duration-500">
              <div className="text-5xl md:text-6xl font-black bg-gradient-to-br from-slate-800 to-slate-400 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-violet-500 transition-all duration-500 mb-3 drop-shadow-sm group-hover:drop-shadow-md">
                {s.value}
              </div>
              <div className="text-[13px] font-black text-slate-800 uppercase tracking-[0.15em] mb-1.5 group-hover:text-indigo-950 transition-colors">
                {s.label}
              </div>
              <div className="text-xs font-semibold text-slate-500 group-hover:text-indigo-500/70 transition-colors">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ FEATURES (Compact Viewport Layout) ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 relative overflow-hidden">
        {/* Decorative Ambient Orbs */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header - Compact & Left Aligned */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-3 mb-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-[0.2em] mb-3 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Tất cả trong một
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Hệ sinh thái <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">IELTS Writing</span>
            </h2>
          </div>
        </div>

        {/* GRID: Symmetric 2x2 - Ultra Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 relative z-10 auto-rows-fr">
          {features.map((f) => (
            <TiltCard
              key={f.title}
              className={`group relative rounded-[1.5rem] md:rounded-[2rem] border-t-2 border-white/90 border-x border-white/60 border-b border-black/5 bg-gradient-to-br ${f.color} p-5 lg:p-6 ${f.comingSoon ? 'opacity-85 grayscale-[15%]' : `hover:shadow-xl hover:-translate-y-2 ${f.shadow} cursor-default`} transition-all duration-500 overflow-hidden shadow-lg shadow-slate-200/40 flex flex-col hover:z-20`}
              tiltDeg={f.comingSoon ? 0 : 10}
            >
              {/* Shine effect optimized for small cards */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" />

              {f.comingSoon && (
                <div className="absolute top-4 right-4 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest animate-pulse shadow-lg z-10 border border-slate-700 ring-1 ring-white/10">
                  Sắp ra mắt
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4 relative z-10">
                <div className={`relative ${f.iconBg} text-white p-2.5 rounded-[1.25rem] flex-shrink-0 group-hover:-translate-y-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl ring-2 ring-white/60 group-hover:ring-white/90`}>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-25 rounded-[1.25rem] transition-opacity animate-pulse" />
                  {f.icon}
                </div>
                <div className="text-center sm:text-left group-hover:translate-x-1 transition-transform duration-500">
                  <span className={`inline-block text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-1.5 ${f.badgeColor} ring-1 ring-inset ring-black/5 shadow-sm group-hover:-translate-y-0.5 transition-transform duration-500`}>
                    {f.badge}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-950 transition-colors drop-shadow-sm">{f.title}</h3>
                </div>
              </div>

              <p className="text-slate-600 text-[13.5px] leading-snug mb-5 flex-1 text-center sm:text-left font-medium group-hover:text-slate-900 transition-colors duration-300 relative z-10">
                {f.description}
              </p>

              <ul className="flex flex-wrap justify-center sm:justify-start gap-1.5 relative z-10 mt-auto">
                {f.highlights.map((h, idx) => (
                  <li
                    key={h}
                    className="group/highlight flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white/70 hover:bg-white px-2.5 py-1.5 rounded-xl border border-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                    style={{ transitionDelay: `${idx * 30}ms` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover/highlight:bg-emerald-500 group-hover/highlight:text-white transition-colors duration-300">
                      <svg className="w-2.5 h-2.5 group-hover/highlight:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {h}
                  </li>
                ))}
              </ul>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS (Sparkling Dark Glass) ═══════════════ */}
      <MouseGlow
        className="bg-[#020617] text-white py-20 relative overflow-hidden"
        glowColor="rgba(129,140,248,0.12)"
        glowSize={800}
      >
        {/* Abstract Space Elements & Starry Grid */}
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black_40%,transparent)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-[0_0_20px_rgba(129,140,248,0.15)] ring-1 ring-white/5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
              Cách hoạt động
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white via-indigo-50 to-slate-400 bg-clip-text text-transparent drop-shadow-2xl">
              3 bước, nhận điểm ngay
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Continuous Light Beam Connector */}
            <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent z-0">
              <div className="absolute top-0 left-1/3 w-32 h-full bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-[1px] animate-[pulse_3s_ease-in-out_infinite] opacity-80" />
            </div>

            {steps.map((step) => (
              <div key={step.num} className="relative z-10">
                {/* Card */}
                <TiltCard
                  className="group bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-indigo-400/30 rounded-[2.5rem] p-8 md:p-10 text-center transition-all duration-500 hover:shadow-[0_0_50px_-15px_rgba(99,102,241,0.4)] hover:-translate-y-3 backdrop-blur-xl overflow-hidden flex flex-col items-center cursor-default"
                  tiltDeg={15}
                >
                  {/* Exquisite Top Glare Line */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Subtle Inner Ambient Shine */}
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" />

                  {/* Icon Block */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-slate-950 border border-white/10 group-hover:border-indigo-400/50 text-indigo-400 group-hover:text-white mb-8 transition-all duration-500 shadow-2xl group-hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] group-hover:-translate-y-2 group-hover:scale-110">
                    <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      {step.icon}
                    </div>
                  </div>

                  {/* Step Badge */}
                  <div className="inline-flex items-center justify-center px-4 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-4 group-hover:bg-indigo-500/20 group-hover:border-indigo-400/50 transition-all duration-300 group-hover:text-white shadow-sm ring-1 ring-inset ring-white/5">
                    Bước {step.num}
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-slate-100 mb-4 group-hover:text-white transition-colors drop-shadow-sm">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors font-medium relative z-10">{step.desc}</p>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </MouseGlow>

      {/* ═══════════════ CTA (Premium Social Proof) ═══════════════ */}
      <section className="relative py-24 md:py-20 bg-slate-50 overflow-hidden border-t border-indigo-50">
        {/* Light ambient decorations to softly compliment the white background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-indigo-600/15 rounded-[100%] blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <TiltCard
            className="group relative p-[1px] rounded-[3rem] overflow-hidden"
            tiltDeg={5}
          >
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/80 via-violet-500/80 to-indigo-500/80 bg-[length:200%_auto] animate-aurora opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Inner Card content with distinct vibrant dark glass */}
            <div className="relative bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-violet-950/90 backdrop-blur-3xl rounded-[3rem] p-10 md:p-16 lg:p-20 text-center overflow-hidden border-t border-white/10 shadow-2xl shadow-indigo-950/50">
              
              {/* Inner ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl pointer-events-none opacity-50 group-hover:opacity-100 group-hover:translate-y-4 transition-all duration-700" />
              
              <div className="relative z-10">
                {/* Avatars Stack (Social Proof) */}
                <div className="flex flex-col items-center justify-center mb-10">
                  <div className="flex -space-x-3 mb-4 group-hover:scale-105 transition-transform duration-500">
                    <img className="w-12 h-12 rounded-full border-2 border-[#020617] object-cover ring-2 ring-indigo-500/20 shadow-lg" src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e0e7ff" alt="User 1" />
                    <img className="w-12 h-12 rounded-full border-2 border-[#020617] object-cover ring-2 ring-indigo-500/20 shadow-lg" src="https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=dbeafe" alt="User 2" />
                    <img className="w-12 h-12 rounded-full border-2 border-[#020617] object-cover ring-2 ring-indigo-500/20 shadow-lg" src="https://api.dicebear.com/7.x/notionists/svg?seed=Jack&backgroundColor=c7d2fe" alt="User 3" />
                    <img className="w-12 h-12 rounded-full border-2 border-[#020617] object-cover ring-2 ring-indigo-500/20 shadow-lg" src="https://api.dicebear.com/7.x/notionists/svg?seed=Mimi&backgroundColor=a5b4fc" alt="User 4" />
                    <div className="w-12 h-12 rounded-full border-2 border-[#020617] bg-indigo-500/20 backdrop-blur-md flex items-center justify-center text-[11px] font-black text-indigo-300 ring-2 ring-indigo-500/20 shadow-lg relative z-10">
                      5k+
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold bg-white/5 px-4 py-1.5 rounded-full border border-white/5 shadow-inner backdrop-blur-sm">
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 fill-current drop-shadow-md" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="tracking-wide">4.9/5 tính trên dữ liệu học viên</span>
                  </div>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-slate-400 mb-6 tracking-tight drop-shadow-2xl leading-[1.15]">
                  Tham gia cộng đồng<br />luyện thi thông minh
                </h2>
                
                <p className="text-slate-400 text-base md:text-lg mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                  Thay vì học mù mờ, hơn <span className="text-indigo-300 font-bold">5,000 bài luận</span> đã được AI của chúng tôi phân tích thành công. Trải nghiệm hệ thống chấm điểm chuẩn quỹ đạo không giới hạn.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                  <Link
                    to="/register"
                    className="group/btn relative px-10 py-5 bg-white text-indigo-950 hover:bg-indigo-50 font-black text-lg rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-300 active:scale-95 flex items-center justify-center overflow-hidden w-full sm:w-auto ring-4 ring-white/10"
                  >
                    <div className="absolute inset-0 w-1/2 h-full bg-indigo-500/15 skew-x-[-25deg] -translate-x-[150%] group-hover/btn:animate-shine" />
                    <span className="relative flex items-center gap-2">
                      Tạo tài khoản miễn phí
                      <svg className="w-6 h-6 group-hover/btn:translate-x-1.5 transition-transform text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  
                  <Link
                    to="/practice"
                    className="px-10 py-5 bg-white/5 text-white font-bold text-lg rounded-2xl border border-white/10 hover:border-indigo-400/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md hover:shadow-2xl hover:shadow-indigo-500/20 w-full sm:w-auto"
                  >
                    Xem thử bài mẫu AI chấm
                  </Link>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
