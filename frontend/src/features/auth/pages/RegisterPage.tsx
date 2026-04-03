import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthService } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

/* ── Mouse Glow Effect ── */
const useMouseGlow = (ref: React.RefObject<HTMLDivElement | null>) => {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const handleMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, [ref]);
  const handleLeave = useCallback(() => setPos({ x: -500, y: -500 }), []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => { el.removeEventListener('mousemove', handleMove); el.removeEventListener('mouseleave', handleLeave); };
  }, [ref, handleMove, handleLeave]);
  return pos;
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowPos = useMouseGlow(cardRef);
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/facebook`;
  };

  const passwordStrength = (() => {
    const p = formData.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { level: score, label: 'Yếu', color: 'bg-red-400' };
    if (score <= 3) return { level: score, label: 'Trung bình', color: 'bg-amber-400' };
    return { level: score, label: 'Mạnh', color: 'bg-emerald-400' };
  })();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      notification.error({ message: 'Mật khẩu không khớp' });
      return;
    }
    try {
      setLoading(true);
      const data = await AuthService.register({
        name: formData.fullName, email: formData.email, password: formData.password
      });
      if (data?.accessToken && data?.user) {
        setAuth(data.accessToken, data.user);
        notification.success({ message: 'Đăng ký thành công!' });
        
        // Chuyển hướng về Dashboard sau khi đăng ký thành công
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      notification.error({
        message: 'Đăng ký thất bại',
        description: error.response?.data?.message || 'Đã xảy ra lỗi'
      });
    } finally {
      setLoading(false);
    }
  };

  const InputField: React.FC<{
    id: string; label: string; type?: string; placeholder: string; value: string;
    icon: React.ReactNode; isPassword?: boolean; showPw?: boolean; onTogglePw?: () => void;
  }> = ({ id, label, type = 'text', placeholder, value, icon, isPassword, showPw, onTogglePw }) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block" htmlFor={id}>{label}</label>
      <div className={`relative rounded-xl border transition-all duration-200 ${focusedField === id ? 'border-indigo-400 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-100' : 'border-slate-200 hover:border-slate-300'}`}>
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <input required value={value} onChange={handleChange} onFocus={() => setFocusedField(id)} onBlur={() => setFocusedField(null)}
          className="w-full pl-11 pr-12 py-3 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 rounded-xl"
          id={id} name={id} placeholder={placeholder} type={isPassword ? (showPw ? 'text' : 'password') : type} minLength={isPassword ? 6 : undefined}
        />
        {isPassword && (
          <button type="button" onClick={onTogglePw} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showPw ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none" />

      <div
        ref={cardRef}
        className="relative w-full max-w-[900px] bg-white rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col md:flex-row z-10 border border-slate-100"
      >
        {/* Mouse glow */}
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full z-0 transition-opacity duration-300"
          style={{ left: glowPos.x, top: glowPos.y, width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', opacity: glowPos.x > -200 ? 1 : 0 }}
        />

        {/* ═══ Left Panel ═══ */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-8 md:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span className="font-extrabold text-lg">BandMates</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight mb-3 leading-snug">
              Bắt đầu hành<br />trình mới! 🚀
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tạo tài khoản miễn phí và bắt đầu luyện Writing với AI Coach thông minh.
            </p>
          </div>

          {/* Features */}
          <div className="relative z-10 hidden md:block mt-8 space-y-3">
            {[
              { icon: '⚡', title: 'Chấm điểm tức thì', desc: 'Nhận Band Score trong vài giây' },
              { icon: '🎯', title: 'Phân tích chi tiết', desc: '4 tiêu chí IELTS chính thức' },
              { icon: '📚', title: 'Từ vựng thông minh', desc: 'IPA, đồng/trái nghĩa, ví dụ' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 hover:bg-white/[0.08] transition-colors">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-[11px] text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Right Panel — Form ═══ */}
        <div className="relative z-10 w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tạo tài khoản</h3>
            <p className="text-sm text-slate-500 mt-1">Điền thông tin bên dưới để bắt đầu</p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <InputField id="fullName" label="Họ và tên" placeholder="Nguyễn Văn A" value={formData.fullName}
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            />
            <InputField id="email" label="Email" type="email" placeholder="name@company.com" value={formData.email}
              icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            />

            <div className="grid grid-cols-2 gap-3">
              <InputField id="password" label="Mật khẩu" placeholder="••••••••" value={formData.password} isPassword showPw={showPassword} onTogglePw={() => setShowPassword(!showPassword)}
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
              />
              <InputField id="confirmPassword" label="Xác nhận" placeholder="••••••••" value={formData.confirmPassword} isPassword showPw={showConfirmPassword} onTogglePw={() => setShowConfirmPassword(!showConfirmPassword)}
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              />
            </div>

            {/* Password strength */}
            {formData.password && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-100'}`} />
                  ))}
                </div>
                <span className={`text-[11px] font-semibold ${passwordStrength.level <= 2 ? 'text-red-500' : passwordStrength.level <= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}

            {/* Submit */}
            <button disabled={loading} className="group relative w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-300/50 hover:shadow-xl active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-70 overflow-hidden mt-2" type="submit">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Tạo tài khoản
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </span>
                )}
              </span>
            </button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold">
                <span className="bg-white px-3 text-slate-400 tracking-widest">Hoặc</span>
              </div>
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-2.5 px-4 py-3 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all text-sm font-semibold text-slate-700 active:scale-[0.98]" type="button">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button onClick={handleFacebookLogin} className="flex items-center justify-center gap-2.5 px-4 py-3 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all text-sm font-semibold text-slate-700 active:scale-[0.98]" type="button">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </div>

            <p className="text-center text-sm text-slate-500">
              Đã có tài khoản? <Link className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors" to="/login">Đăng nhập</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
