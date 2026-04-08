import React from 'react';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { instance, accounts, inProgress } = useMsal();

  const user = accounts[0];
  const isBusy = inProgress !== InteractionStatus.None;

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
    });
  };

  return (
    <header
      className="relative px-6 py-6 border-b z-40 backdrop-blur-sm no-print"
      style={{
        backgroundColor: '#020617',
        backgroundImage: 'radial-gradient(circle at 15% 40%, rgba(124,58,237,0.35) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(14,165,233,0.35) 0%, transparent 45%)',
        borderColor: 'rgba(255,255,255,0.06)'
      }}
    >
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6 w-full fade-in">
        <div className="flex flex-col items-start gap-4">
          <Logo className="h-12 w-auto brightness-125" />
          <div className="brand-section">
            <h1 className="font-bebas text-[2.5rem] tracking-[0.05em] leading-tight" style={{ color: '#e2e8f0' }}>
              ISO TANK <span className="text-[#0ea5e9] font-bold">LOAD</span> ALLOCATOR
            </h1>
            <p className="font-mono text-base uppercase tracking-[0.25em] mt-2" style={{ color: '#64748b' }}>
              AAW Bulk Liquid Logistics · Precision Yield Engine
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-6 pb-1">
          <button
            onClick={toggleTheme}
            className="p-3 px-5 rounded-xl border border-white/10 hover:border-sky-500/40 transition-all flex items-center gap-3 group shadow-sm"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <>
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span className="text-sm font-mono uppercase tracking-widest font-semibold">Dark Mode</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                <span className="text-sm font-mono uppercase tracking-widest font-semibold">Light Mode</span>
              </>
            )}
          </button>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3 pl-4 border-l border-white/10 group relative">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold tracking-wide" style={{ color: '#e2e8f0' }}>{user.name}</span>
                    <button
                      onClick={handleLogout}
                      disabled={isBusy}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] hover:text-sky-400 transition-colors disabled:opacity-50"
                      style={{ color: '#64748b' }}
                    >
                      Sign Out
                    </button>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold text-sky-400 shadow-inner group-hover:border-sky-500/40 transition-all"
                    style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)' }}
                  >
                    {user.name?.charAt(0) || user.username.charAt(0)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
