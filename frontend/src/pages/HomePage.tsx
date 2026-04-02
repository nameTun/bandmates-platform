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
    description: 'Nộp bài và nhận điểm Band Score tức thì. AI phân tích sâu từng tiêu chí: Task Response, Coherence, Lexical Resource, Grammatical Range.',
    highlights: ['Task 1 & Task 2', 'Band 4.0 → 9.0', 'Chỉ ra lỗi theo danh mục'],
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
    description: 'Tra bất kỳ từ nào và nhận ngay phiên âm IPA, từ loại, đồng nghĩa, trái nghĩa và ví dụ thực tế trong văn phong học thuật.',
    highlights: ['Phiên âm IPA', 'Đồng / Trái nghĩa', 'Ví dụ thực tế'],
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    badge: 'Coming Soon',
    badgeColor: 'bg-purple-100 text-purple-700',
    title: 'Học từ vựng theo chủ đề',
    description: 'Bộ từ vựng được chuẩn hóa theo chủ đề (Environment, Technology...) và theo Band điểm mục tiêu, giúp bạn học có hệ thống.',
    highlights: ['Theo chủ đề', 'Theo Band điểm', 'Lộ trình cá nhân'],
    color: 'from-purple-50 to-violet-50',
    border: 'border-purple-200/70',
    iconBg: 'bg-purple-500',
    shadow: 'shadow-purple-100',
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

      {/* ═══════════════ HERO ═══════════════ */}
      <MouseGlow
        className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white"
        glowColor="rgba(129,140,248,0.12)"
        glowSize={600}
      >
        {/* Floating particles / decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-indigo-400/60 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-violet-400/50 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-sky-400/40 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-28 md:py-40 text-center">
          {/* Badge with glow */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-8 backdrop-blur-sm shadow-lg shadow-indigo-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
            </span>
            AI-Powered IELTS Writing Coach
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Chinh phục{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                Band 7+
              </span>
              {/* Underline glow */}
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 rounded-full opacity-50 blur-sm" />
            </span>
            <br />với AI Writing Coach
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Nộp bài viết IELTS và nhận phân tích chi tiết tức thì — Band Score, lỗi sai có giải thích,
            gợi ý cải thiện. Không cần chờ giáo viên.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link
                to="/practice"
                className="group px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-base rounded-xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-400/40 transition-all active:scale-95 flex items-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Bắt đầu luyện tập
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group relative px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-base rounded-xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-400/50 transition-all active:scale-95 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Bắt đầu miễn phí</span>
                </Link>
                <Link
                  to="/practice"
                  className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-base rounded-xl border border-white/20 hover:border-white/30 transition-all backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                >
                  Thử ngay (Khách)
                </Link>
              </>
            )}
          </div>

          <p className="text-slate-500 text-sm mt-8">
            Miễn phí 3 lần chấm / ngày cho Khách · Không cần thẻ tín dụng
          </p>
        </div>
      </MouseGlow>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="border-b border-slate-100 bg-slate-50/80">
        <div className="max-w-4xl mx-auto px-6 py-14 grid grid-cols-3 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label} className="group">
              <div className="text-4xl font-extrabold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{s.value}</div>
              <div className="text-sm font-semibold text-slate-700">{s.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-3">Tính năng</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Mọi thứ bạn cần để cải thiện Writing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {features.map(f => (
            <TiltCard
              key={f.title}
              className={`relative rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} p-8 ${f.comingSoon ? 'opacity-70' : `hover:shadow-xl ${f.shadow} cursor-default`} transition-all duration-300`}
              tiltDeg={f.comingSoon ? 0 : 5}
            >
              {f.comingSoon && (
                <div className="absolute top-4 right-4 bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide animate-pulse">
                  Sắp ra mắt
                </div>
              )}
              <div className="flex items-start gap-4 mb-5">
                <div className={`${f.iconBg} text-white p-3 rounded-xl shadow-lg flex-shrink-0`}>
                  {f.icon}
                </div>
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{f.title}</h3>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed mb-5">{f.description}</p>
              <ul className="flex flex-wrap gap-2">
                {f.highlights.map(h => (
                  <li key={h} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full border border-white shadow-sm">
                    <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <MouseGlow
        className="bg-slate-950 text-white py-28"
        glowColor="rgba(129,140,248,0.08)"
        glowSize={500}
      >
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-3">Cách hoạt động</p>
            <h2 className="text-4xl font-extrabold tracking-tight">3 bước, nhận điểm ngay</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-14 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px">
                    <div className="h-full bg-gradient-to-r from-indigo-500/50 via-indigo-400/30 to-transparent" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-400/50 rounded-full" />
                  </div>
                )}
                {/* Card */}
                <TiltCard
                  className="relative z-10 group bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-indigo-400/30 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 backdrop-blur-sm"
                  tiltDeg={8}
                >
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/15 group-hover:bg-indigo-500/25 text-indigo-400 group-hover:text-indigo-300 mb-5 transition-all duration-300 border border-indigo-400/10 group-hover:border-indigo-400/20 shadow-lg shadow-indigo-500/5">
                    {step.icon}
                  </div>
                  {/* Step number */}
                  <div className="text-xs font-black text-indigo-500/50 uppercase tracking-[0.2em] mb-2">Bước {step.num}</div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-200 transition-colors">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{step.desc}</p>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </MouseGlow>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="max-w-4xl mx-auto px-6 py-28 text-center">
        <TiltCard
          className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 rounded-3xl p-14 shadow-2xl shadow-indigo-200 relative overflow-hidden"
          tiltDeg={3}
        >
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Sẵn sàng nâng Band Score?
            </h2>
            <p className="text-indigo-100 mb-8 text-base max-w-lg mx-auto">
              Tạo tài khoản miễn phí và bắt đầu luyện ngay hôm nay.
              Không giới hạn thời gian, không cam kết.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-white text-indigo-600 font-extrabold rounded-xl hover:bg-indigo-50 transition-all active:scale-95 shadow-xl overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">Đăng ký miễn phí</span>
              </Link>
              <Link
                to="/practice"
                className="px-8 py-4 bg-white/15 text-white font-bold rounded-xl border border-white/25 hover:bg-white/25 hover:border-white/40 transition-all backdrop-blur-sm hover:shadow-lg"
              >
                Thử không cần đăng ký
              </Link>
            </div>
          </div>
        </TiltCard>
      </section>

    </div>
  );
};

export default HomePage;
