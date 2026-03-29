import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, BarChart, Sparkles, Facebook } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google`;
    };

    const handleFacebookLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/facebook`;
    };
    return (
        <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 md:py-12 bg-background">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                
                {/* Left Side: Registration Form */}
                <div className="bg-surface p-8 md:p-10 rounded-xl shadow-sm border border-outline ring-1 ring-slate-200/50">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-on-surface mb-2">Create your account</h1>
                        <p className="text-secondary text-sm">Join the next generation of academic excellence with AI-powered insights.</p>
                    </div>

                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-secondary" htmlFor="full-name">Full Name</label>
                                <input className="w-full px-4 py-3 rounded-lg border border-outline bg-surface-container-low focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" id="full-name" name="full-name" placeholder="Enter your full name" type="text" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-secondary" htmlFor="email">Email Address</label>
                                <input className="w-full px-4 py-3 rounded-lg border border-outline bg-surface-container-low focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" id="email" name="email" placeholder="name@example.com" type="email" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-secondary" htmlFor="password">Password</label>
                                    <input className="w-full px-4 py-3 rounded-lg border border-outline bg-surface-container-low focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" id="password" name="password" placeholder="••••••••" type="password" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-secondary" htmlFor="confirm-password">Confirm Password</label>
                                    <input className="w-full px-4 py-3 rounded-lg border border-outline bg-surface-container-low focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-on-surface" id="confirm-password" name="confirm-password" placeholder="••••••••" type="password" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 py-2">
                            <input className="mt-1 h-4 w-4 text-primary border-outline rounded focus:ring-primary cursor-pointer" id="terms" type="checkbox" />
                            <label className="text-xs text-secondary leading-normal select-none cursor-pointer" htmlFor="terms">
                                By creating an account, you agree to our <a className="text-primary font-medium hover:underline" href="#">Terms of Service</a> and <a className="text-primary font-medium hover:underline" href="#">Privacy Policy</a>.
                            </label>
                        </div>

                        <button className="w-full bg-primary text-white font-semibold py-3.5 rounded-lg shadow-lg hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex justify-center items-center gap-2" type="submit">
                            Create Account
                            <ArrowRight size={18} />
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface px-3 text-secondary font-medium tracking-widest">Or sign up with</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-outline rounded-lg hover:bg-surface-variant transition-colors text-sm font-medium" 
                                type="button">
                                <img alt="Google icon" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs20y1Q2imgxBlKoxVUnBHIprq0_wS7thJiBNn3Newlo4gY5dhjsPiUdS7ATcrNMVLK1oUwt24AuZZo27mzGt2TldiMGByaupWcCk-WACcbQqqYkkBhDsxq6o22wgxIU2B9n9gNRLTB3MRq1kGS5lB1g3YsuMLkAQti5iONSlpzmci1gT6sQKw316jJdAsizSE5u_53-OKY6KDXZzql4CEHRochQW13vIMKa_uQUCG8ncigqYVcmA3YVh0dynsWdmI4OPoe3ZsrIeO"/>
                                Google
                            </button>
                            <button 
                                onClick={handleFacebookLogin}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-outline rounded-lg hover:bg-surface-variant transition-colors text-sm font-medium" 
                                type="button">
                                <Facebook size={18} className="text-[#1877F2]" />
                                Facebook
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-secondary">
                        Already have an account? <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1" to="/login">Sign In</Link>
                    </p>
                </div>

                {/* Right Side: Value Props & Visual Content */}
                <div className="lg:sticky lg:top-32 space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight leading-tight">Master your academic journey with <span className="text-primary">BandMates AI</span>.</h2>
                        <p className="text-secondary leading-relaxed">Join thousands of students and researchers who use our Indigo Scholar technology to refine their writing and boost their cognitive productivity.</p>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Why join BandMates?</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Bento-ish Info Cards */}
                            <div className="bg-surface-bright border border-outline p-5 rounded-xl shadow-sm flex items-start gap-4 hover:border-primary/30 transition-colors">
                                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-on-surface">Instant AI Scoring</h4>
                                    <p className="text-sm text-secondary mt-1">Get real-time feedback and band scores based on professional examination standards.</p>
                                </div>
                            </div>
                            
                            <div className="bg-surface-bright border border-outline p-5 rounded-xl shadow-sm flex items-start gap-4 hover:border-primary/30 transition-colors">
                                <div className="bg-tertiary/10 p-3 rounded-lg text-tertiary">
                                    <BarChart size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-on-surface">Detailed Feedback</h4>
                                    <p className="text-sm text-secondary mt-1">Receive granular corrections on grammar, syntax, and flow with our high-contrast correction cards.</p>
                                </div>
                            </div>
                            
                            <div className="bg-surface-bright border border-outline p-5 rounded-xl shadow-sm flex items-start gap-4 hover:border-primary/30 transition-colors">
                                <div className="bg-on-primary-fixed-variant/10 p-3 rounded-lg text-on-primary-fixed-variant">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-on-surface">Contextual AI Writing</h4>
                                    <p className="text-sm text-secondary mt-1">Our 'Digital Tutor' learns your voice and helps you articulate complex ideas more effectively.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Abstract Decorative Element */}
                    <div className="relative overflow-hidden rounded-xl h-48 bg-gradient-to-br from-primary/5 to-primary/20 border border-primary/10">
                        <img className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" alt="abstract top-down view of a clean minimalist desk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyiHRzk1pUc_PryPvRNT1yo05p-qhnWIX-R78w6CLfZ6BzRMJktqqsvWVsBnNgDuHk44sFrC-USJqkAQ34PYYELu7ciVAW1pxum9-1DXzcs0ah_WreMczaQDqqegL4IskfE_h860kIZqqfKyE3grdBbiIDlYxcYTU4DXfO8lba0MqnfW8k9MRSztic8mY6r3Zs1A18QTUBuOmxwmgAeYiU1GnBI6BPkJYMBRRlSMnUb_D67PxiyTXnGsb45Z7xk2W5bIFAQgodXnIh" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center px-6">
                                <p className="text-indigo-900/80 font-medium italic text-sm">"The most intuitive writing assistant I've ever used. Truly elite."</p>
                                <p className="mt-2 text-xs font-bold text-primary uppercase">— Oxford Research Fellow</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default RegisterPage;
