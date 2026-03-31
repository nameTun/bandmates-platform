import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, BarChart, Sparkles, Facebook, Eye, EyeOff } from 'lucide-react';
import { notification } from 'antd';
import api from '../../../lib/api';
import { useAuthStore } from '../store/useAuthStore';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
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

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            notification.error({ message: 'Passwords do not match' });
            return;
        }
        
        try {
            setLoading(true);
            const res = await api.post('/auth/register', {
                name: formData.fullName,
                email: formData.email,
                password: formData.password
            });
            
            if (res.data && res.data.accessToken && res.data.user) {
                setAuth(res.data.accessToken, res.data.user);
                notification.success({ message: 'Registration successful!' });
                navigate('/', { replace: true });
            }
        } catch (error: any) {
            notification.error({ 
                message: 'Registration failed', 
                description: error.response?.data?.message || 'Something went wrong'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4 relative overflow-hidden bg-surface-container-lowest">
            {/* Ambient Background Blobs for Creativity */}
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[100px] mix-blend-multiply pointer-events-none transition-all duration-1000 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-tertiary/10 blur-[100px] mix-blend-multiply pointer-events-none transition-all duration-1000"></div>

            {/* Central Floating Glass Card */}
            <div className="w-full max-w-4xl bg-white/70 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative z-10 transform transition-all hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]">
                
                {/* Left Panel: Branding & Value Props */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-primary to-primary-fixed-dim p-8 md:p-10 flex flex-col justify-between text-white relative overflow-hidden group">
                    {/* Decorative Overlay Pattern */}
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] transition-transform duration-700 group-hover:scale-110"></div>
                    
                    {/* Floating Abstract Shape */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center p-2 bg-white/20 rounded-xl backdrop-blur-md mb-6 shadow-inner border border-white/20">
                            <Sparkles size={24} className="text-white drop-shadow-md" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 drop-shadow-sm">Start your journey.</h2>
                        <p className="text-white/90 text-sm leading-relaxed drop-shadow-sm">Join the next generation of academic excellence with AI-powered feedback.</p>
                    </div>
                    
                    <div className="relative z-10 mt-8 space-y-4">
                        <div className="flex items-center gap-3 transform transition-transform hover:translate-x-1">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm"><Zap size={14} className="text-white" /></div>
                            <span className="text-sm font-medium drop-shadow-sm">Instant AI Scoring</span>
                        </div>
                        <div className="flex items-center gap-3 transform transition-transform hover:translate-x-1">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm"><BarChart size={14} className="text-white" /></div>
                            <span className="text-sm font-medium drop-shadow-sm">Detailed Corrections</span>
                        </div>
                        <div className="flex items-center gap-3 transform transition-transform hover:translate-x-1">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm"><Sparkles size={14} className="text-white" /></div>
                            <span className="text-sm font-medium drop-shadow-sm">Contextual Digital Tutor</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: The Form */}
                <div className="w-full md:w-7/12 p-6 md:p-8 bg-white/40 flex flex-col justify-center">
                    <div className="mb-4 text-center">
                        <h3 className="text-2xl font-bold text-on-surface tracking-tight">Create Account</h3>
                    </div>

                    <form className="space-y-3.5 flex-1" onSubmit={onSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-secondary ml-1" htmlFor="fullName">Full Name</label>
                                <input required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-outline bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-sm shadow-sm hover:border-primary/50" id="fullName" name="fullName" placeholder="John Doe" type="text" />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-secondary ml-1" htmlFor="email">Email Address</label>
                                <input required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-outline bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-sm shadow-sm hover:border-primary/50" id="email" name="email" placeholder="name@example.com" type="email" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-secondary ml-1" htmlFor="password">Password</label>
                                <div className="relative">
                                    <input required value={formData.password} onChange={handleChange} minLength={6} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-outline bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-sm shadow-sm hover:border-primary/50" id="password" name="password" placeholder="••••••••" type={showPassword ? "text" : "password"} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors focus:outline-none flex items-center justify-center">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-secondary ml-1" htmlFor="confirmPassword">Confirm Password</label>
                                <div className="relative">
                                    <input required value={formData.confirmPassword} onChange={handleChange} minLength={6} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-outline bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface text-sm shadow-sm hover:border-primary/50" id="confirmPassword" name="confirmPassword" placeholder="••••••••" type={showConfirmPassword ? "text" : "password"} />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors focus:outline-none flex items-center justify-center">
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-1">
                            <input required className="w-3.5 h-3.5 text-primary border-outline rounded focus:ring-primary cursor-pointer transition-colors" id="terms" type="checkbox" />
                            <label className="text-[11px] text-secondary leading-none select-none cursor-pointer" htmlFor="terms">
                                I agree to the <a className="text-primary font-bold hover:underline" href="#">Terms</a> & <a className="text-primary font-bold hover:underline" href="#">Privacy</a>.
                            </label>
                        </div>

                        <button disabled={loading} className="w-full bg-primary text-white font-bold py-2.5 rounded-xl shadow-[0_8px_16px_-6px_rgba(72,72,229,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(72,72,229,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-70" type="submit">
                            {loading ? 'Processing...' : 'Sign Up'}
                            {!loading && <ArrowRight size={16} />}
                        </button>

                        <div className="relative py-2.5">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline/50"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-[#fcfcfd] px-3 text-secondary tracking-widest rounded-full">Or connect with</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 px-4 py-2 border border-outline bg-white/80 backdrop-blur-sm rounded-xl hover:bg-surface-variant transition-colors text-xs font-bold shadow-sm hover:shadow-md" type="button">
                                <img alt="Google" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs20y1Q2imgxBlKoxVUnBHIprq0_wS7thJiBNn3Newlo4gY5dhjsPiUdS7ATcrNMVLK1oUwt24AuZZo27mzGt2TldiMGByaupWcCk-WACcbQqqYkkBhDsxq6o22wgxIU2B9n9gNRLTB3MRq1kGS5lB1g3YsuMLkAQti5iONSlpzmci1gT6sQKw316jJdAsizSE5u_53-OKY6KDXZzql4CEHRochQW13vIMKa_uQUCG8ncigqYVcmA3YVh0dynsWdmI4OPoe3ZsrIeO"/>
                                Google
                            </button>
                            <button onClick={handleFacebookLogin} className="flex items-center justify-center gap-2 px-4 py-2 border border-outline bg-white/80 backdrop-blur-sm rounded-xl hover:bg-surface-variant transition-colors text-xs font-bold shadow-sm hover:shadow-md" type="button">
                                <Facebook size={16} className="text-[#1877F2]" />
                                Facebook
                            </button>
                        </div>
                        
                        <p className="mt-2 text-center text-xs text-secondary font-medium">
                            Already a member? <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1" to="/login">Sign In</Link>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default RegisterPage;
