import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../../../lib/api';
import { Spin, notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Sparkles, CheckCircle, Info, Facebook, ArrowRight, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const status = searchParams.get('status');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const verifyLogin = async () => {
            if (status === 'success') {
                try {
                    const response = await api.post('/auth/refresh');
                    if (response.data && response.data.accessToken && response.data.user) {
                        setAuth(response.data.accessToken, response.data.user);
                        notification.success({ message: 'Login successfully!', placement: 'topRight' });
                        navigate('/', { replace: true });
                    }
                } catch (e) {
                    notification.error({ message: 'Failed to complete login', placement: 'topRight' });
                    navigate('/login', { replace: true });
                }
            } else if (status === 'error') {
                notification.error({ message: 'Authentication failed', placement: 'topRight' });
            }
        };
        verifyLogin();
    }, [searchParams, setAuth, navigate, status]);

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google`;
    };

    const handleFacebookLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/facebook`;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.post('/auth/login', { email, password });
            console.log(res);
            if (res.data && res.data.accessToken && res.data.user) {
                setAuth(res.data.accessToken, res.data.user);
                notification.success({ message: 'Login successfully!', placement: 'topRight' });
                navigate('/', { replace: true });
            }
        } catch (error: any) {
            notification.error({ 
                message: 'Login failed', 
                description: error.response?.data?.message || 'Invalid email or password',
                placement: 'topRight'
            });
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#4848e5' }} spin />} />
                <p className="mt-4 text-secondary font-medium">Verifying your account...</p>
            </div>
        );
    }

    return (
        <main className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4 relative overflow-hidden bg-surface-container-lowest">
            {/* Ambient Background Blobs for Creativity */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[100px] mix-blend-multiply pointer-events-none transition-all duration-1000 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-tertiary/10 blur-[100px] mix-blend-multiply pointer-events-none transition-all duration-1000"></div>

            {/* Central Floating Glass Card */}
            <div className="w-full max-w-4xl bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative z-10 transform transition-all hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]">
                
                {/* Left Panel: Branding & Visual Content */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-primary to-primary-fixed-dim p-8 md:p-10 flex flex-col justify-between text-white relative overflow-hidden group">
                    {/* Decorative Overlay Pattern */}
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] transition-transform duration-700 group-hover:scale-110"></div>
                    
                    {/* Floating Abstract Shape */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 mb-8 md:mb-0">
                        <div className="inline-flex items-center justify-center p-2 bg-white/20 rounded-xl backdrop-blur-md mb-6 shadow-inner border border-white/20">
                            <Sparkles size={24} className="text-white drop-shadow-md" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 drop-shadow-sm">Welcome back.</h2>
                        <p className="text-white/90 text-sm leading-relaxed drop-shadow-sm">Sign in to view your latest essay feedback and continue your academic journey.</p>
                    </div>
                    
                    {/* IELTS Component Representation (Mini) */}
                    <div className="relative z-10 hidden md:block">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <span className="text-white/60 text-[9px] font-bold tracking-widest uppercase block mb-1">LATEST ESSAY</span>
                                    <h3 className="text-white text-sm font-semibold">IELTS Task 2</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full border-2 border-tertiary flex items-center justify-center bg-white/10 shadow-inner">
                                    <span className="text-white text-sm font-bold">7.5</span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle size={14} className="text-tertiary" />
                                        <span className="text-white text-[11px] font-medium">Lexical Resource</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-tertiary w-[80%] rounded-full"></div>
                                    </div>
                                </div>
                                
                                <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info size={14} className="text-primary-fixed-dim" />
                                        <span className="text-white text-[11px] font-medium">Grammatical Range</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-fixed-dim w-[65%] rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: The Form */}
                <div className="w-full md:w-7/12 p-6 md:p-10 bg-white/40 flex flex-col justify-center">
                    <div className="mb-6 text-center">
                        <h3 className="text-2xl font-bold text-on-surface tracking-tight">Sign In</h3>
                    </div>

                    <form className="space-y-4 flex-1" onSubmit={onSubmit}>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-secondary ml-1" htmlFor="email">Email address</label>
                            <input required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-outline bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-sm shadow-sm hover:border-primary/50" id="email" name="email" placeholder="name@company.com" type="email" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1 mb-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-secondary" htmlFor="password">Password</label>
                                <a className="text-[11px] font-bold text-primary hover:text-on-primary-fixed-variant transition-colors" href="#">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <input required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 pr-10 rounded-xl border border-outline bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-sm shadow-sm hover:border-primary/50" id="password" name="password" placeholder="••••••••" type={showPassword ? "text" : "password"} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors focus:outline-none flex items-center justify-center">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 py-1">
                            <input className="w-3.5 h-3.5 text-primary border-outline rounded focus:ring-primary cursor-pointer transition-colors" id="remember" name="remember" type="checkbox" />
                            <label className="text-[11px] text-secondary leading-none select-none cursor-pointer" htmlFor="remember">Remember me for 30 days</label>
                        </div>

                        <button disabled={loading} className="w-full bg-primary text-white font-bold mt-2 py-3.5 rounded-xl shadow-[0_8px_16px_-6px_rgba(72,72,229,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(72,72,229,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-70" type="submit">
                            {loading ? 'Processing...' : 'Sign In'}
                            {!loading && <ArrowRight size={16} />}
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline/50"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-[#fcfcfd] px-3 text-secondary tracking-widest rounded-full">Or continue with</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-outline bg-white/80 backdrop-blur-sm rounded-xl hover:bg-surface-variant transition-colors text-xs font-bold shadow-sm hover:shadow-md" type="button">
                                <img alt="Google" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARmxcXotXH_Q6OT151_l6Fo-IPzX60f4a6GC5XqLURChumjE1mj_ov18fjWKD9fKbQrz30tZ2l2fQ1u9P7hOZzxB9iNIusLLNaFdTHuXkLsLSDpfHgMhdfsV2qPU70BD_kkSieFZY8tUtMcEIupOuawH9tG9Xy3KUVoS1J_cm3D9T64ovEguJY0Ky6jw3rFgqOUKIz4D6xc8Lq0Vw4PBQpFGLjIX9iDgm0dls-oZqjeWs6tF_ahYgHw5WbXcpHaBJy_6oC8AZ2UB-U"/>
                                Google
                            </button>
                            <button onClick={handleFacebookLogin} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-outline bg-white/80 backdrop-blur-sm rounded-xl hover:bg-surface-variant transition-colors text-xs font-bold shadow-sm hover:shadow-md" type="button">
                                <Facebook size={16} className="text-[#1877F2]" />
                                Facebook
                            </button>
                        </div>
                        
                        <p className="mt-4 text-center text-xs text-secondary font-medium">
                            Don't have an account? <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1" to="/register">Create an account</Link>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;
