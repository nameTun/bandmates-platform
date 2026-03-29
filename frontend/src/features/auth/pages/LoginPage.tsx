import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../../../lib/api';
import { Spin, notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Sparkles, CheckCircle, Info, Facebook } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const status = searchParams.get('status');

    useEffect(() => {
        const verifyLogin = async () => {
            if (status === 'success') {
                try {
                    const response = await api.get('/auth/profile');
                    if (response.data) {
                        setAuth(response.data);
                        notification.success({ message: 'Login successfully!', placement: 'topRight' });
                        navigate('/', { replace: true });
                    }
                } catch (e) {
                    notification.error({ message: 'Failed to complete login', placement: 'topRight' });
                    navigate('/login', { replace: true });
                }
            } else if (status === 'error') {
                notification.error({ message: 'Google Authentication failed', placement: 'topRight' });
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

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#4848e5' }} spin />} />
                <p className="mt-4 text-secondary font-medium">Verifying your account...</p>
            </div>
        );
    }

    return (
        <main className="min-h-[calc(100vh-64px)] flex items-stretch text-on-background selection:bg-primary-container selection:text-primary">
            {/* Left Side: Feature Highlight */}
            <section className="hidden lg:flex lg:w-1/2 feature-gradient relative overflow-hidden items-center justify-center p-8">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full border border-white"></div>
                    <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 rounded-full border border-white"></div>
                </div>
                
                <div className="relative z-10 max-w-lg w-full scale-95">
                    {/* AI Scoring Component Representation */}
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-xl shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-1 block">IELTS WRITING TASK 2</span>
                                <h2 className="text-white text-xl font-semibold">Essay Analysis</h2>
                            </div>
                            <div className="w-14 h-14 rounded-full border-4 border-tertiary flex items-center justify-center bg-white/10">
                                <span className="text-white text-lg font-bold">7.5</span>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle size={16} className="text-tertiary" />
                                    <span className="text-white text-sm font-medium">Lexical Resource</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-tertiary w-[80%]"></div>
                                </div>
                            </div>
                            
                            <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Info size={16} className="text-primary-fixed-dim" />
                                    <span className="text-white text-sm font-medium">Grammatical Range</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-fixed-dim w-[65%]"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="text-white/80 text-sm italic leading-relaxed">
                                "The candidate demonstrates a wide range of vocabulary with very natural and sophisticated control of lexical features."
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <h1 className="text-white text-3xl font-bold leading-tight mb-3">Precision IELTS scoring <br/>powered by AI.</h1>
                        <p className="text-white/70 text-base leading-relaxed max-w-md">
                            Get instant, high-fidelity feedback on your writing performance. BandMates AI analyzes your work across all official assessment criteria.
                        </p>
                    </div>
                </div>
            </section>
            
            {/* Right Side: Login Form */}
            <section className="flex-1 flex flex-col justify-center items-center p-6 lg:p-10 bg-background overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Brand Anchor */}
                    <div className="mb-8 flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-on-background">BandMates AI</span>
                    </div>
                    
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-on-background mb-2">Welcome back</h2>
                        <p className="text-base text-secondary">Please enter your details to sign in.</p>
                    </div>
                    
                    {/* Form */}
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="email">Email address</label>
                            <input className="w-full px-4 py-3 rounded-lg border-outline border bg-white text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-secondary/50 outline-none" id="email" name="email" placeholder="name@company.com" type="email"/>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="password">Password</label>
                                <a className="text-xs font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors" href="#">Forgot password?</a>
                            </div>
                            <input className="w-full px-4 py-3 rounded-lg border-outline border bg-white text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-secondary/50 outline-none" id="password" name="password" placeholder="••••••••" type="password"/>
                        </div>
                        <div className="flex items-center gap-2 py-1">
                            <input className="w-4 h-4 rounded border-outline text-primary focus:ring-primary cursor-pointer" id="remember" name="remember" type="checkbox"/>
                            <label className="text-sm text-secondary select-none cursor-pointer" htmlFor="remember">Remember me for 30 days</label>
                        </div>
                        <button className="w-full py-3 px-4 bg-primary text-white font-semibold text-base rounded-lg hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all shadow-md shadow-primary/20" type="submit">
                            Sign In
                        </button>
                    </form>
                    
                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-outline"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-4 text-secondary font-medium tracking-widest">Or continue with</span>
                        </div>
                    </div>
                    
                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-outline bg-white hover:bg-surface-variant transition-colors active:scale-[0.98]">
                            <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARmxcXotXH_Q6OT151_l6Fo-IPzX60f4a6GC5XqLURChumjE1mj_ov18fjWKD9fKbQrz30tZ2l2fQ1u9P7hOZzxB9iNIusLLNaFdTHuXkLsLSDpfHgMhdfsV2qPU70BD_kkSieFZY8tUtMcEIupOuawH9tG9Xy3KUVoS1J_cm3D9T64ovEguJY0Ky6jw3rFgqOUKIz4D6xc8Lq0Vw4PBQpFGLjIX9iDgm0dls-oZqjeWs6tF_ahYgHw5WbXcpHaBJy_6oC8AZ2UB-U"/>
                            <span className="text-sm font-semibold text-on-surface">Google</span>
                        </button>
                        <button 
                            type="button" 
                            onClick={handleFacebookLogin}
                            className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-outline bg-white hover:bg-surface-variant transition-colors active:scale-[0.98]">
                            <Facebook size={20} className="text-[#1877F2]" />
                            <span className="text-sm font-semibold text-on-surface">Facebook</span>
                        </button>
                    </div>
                    
                    <p className="mt-8 text-center text-sm text-secondary">
                        Don't have an account? 
                        <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1" to="/register">Get Started</Link>
                    </p>
                </div>
                
                {/* Footer Small */}
                <footer className="mt-10 text-xs text-secondary flex gap-5">
                    <a className="hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
                    <a className="hover:text-on-surface transition-colors" href="#">Terms of Service</a>
                    <a className="hover:text-on-surface transition-colors" href="#">Support</a>
                </footer>
            </section>
        </main>
    );
};

export default LoginPage;
