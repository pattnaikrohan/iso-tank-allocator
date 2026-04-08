import React, { useState } from 'react';
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "../authConfig";
import { motion } from 'framer-motion';
import Logo from './Logo';

const LoginPage: React.FC = () => {
    const { instance, inProgress } = useMsal();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (inProgress !== InteractionStatus.None) return;

        setIsLoading(true);
        setError(null);

        try {
            await instance.loginRedirect({
                ...loginRequest,
                prompt: 'select_account' // Forces the Microsoft login screen and MFA prompt
            });
        } catch (err: any) {
            console.error("Microsoft Redirect failed", err);
            setError(err.message || 'An error occurred triggering the Microsoft redirect');
            setIsLoading(false);
        }
    };

    const isBusy = inProgress !== InteractionStatus.None || isLoading;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background transition-colors duration-500">
            {/* Background Aesthetics - Matching App.tsx */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/5 blur-[120px] rounded-full animate-pulse transition-opacity duration-1000"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full transition-opacity duration-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-8"
            >
                <div className="glass-heavy p-10 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-3xl text-center">
                    <div className="flex justify-center mb-8 relative">
                        {/* More subtle white glow effect */}
                        <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-100 -translate-x-[0.25cm]"></div>
                        <Logo className="h-20 w-auto transition-transform hover:scale-110 duration-500 text-black relative z-10 -translate-x-[-0.24cm]" />
                    </div>

                    <div className="brand-section mb-10 text-center">
                        <h1 className="font-bebas text-[1.8rem] tracking-[0.05em] text-main leading-tight transition-colors duration-500">
                            Single Sign-On
                        </h1>
                        <p className="text-xs font-mono text-muted uppercase tracking-[0.2em] mt-2">
                            ISO TANK LOAD ALLOCATOR
                        </p>
                    </div>

                    <div className="flex flex-col items-center space-y-8">
                        {error && (
                            <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono text-center animate-shake">
                                {error}
                            </div>
                        )}
                        <button
                            disabled={isBusy}
                            onClick={handleLogin}
                            className="w-full flex items-center justify-center gap-4 py-4 px-6 text-lg font-bold bg-white text-[#333] border border-[#ccc] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50"
                        >
                            <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 23 23">
                                <path fill="#f35325" d="M1 1h10v10H1z" />
                                <path fill="#81bc06" d="M12 1h10v10H12z" />
                                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                <path fill="#ffba08" d="M12 12h10v10H12z" />
                            </svg>
                            <span className="font-sans">Sign In with Microsoft</span>
                            {isBusy && (
                                <div className="absolute right-4 animate-spin h-5 w-5 border-2 border-sky-400 border-t-transparent rounded-full"></div>
                            )}
                        </button>

                        <div className="relative pt-4">
                            <div className="relative flex justify-center text-xs uppercase tracking-[0.3em] font-mono text-muted/60">
                                <span className="glass px-4 py-1 rounded-full border border-white/5 font-bold">Authorized Personnel Only</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[11px] font-mono text-muted/60 uppercase tracking-widest font-bold">
                        © 2026 AAW Bulk Liquid Logistics · Port Operations
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
