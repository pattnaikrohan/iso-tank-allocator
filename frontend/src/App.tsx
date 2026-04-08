import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import AllocatorTab from './components/AllocatorTab';
import FleetTab from './components/FleetTab';
import { useAllocation } from './hooks/useAllocation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export type TabType = 'allocator' | 'fleet' | 'products';

function App() {
  const { inProgress } = useMsal();
  const [activeTab, setActiveTab] = useState<TabType>('allocator');
  const { fleet } = useAllocation();

  // Robust detection for MSAL popup windows to avoid recursive React rendering
  // We explicitly check for window.opener AND the MSAL-specific window name
  const isMsalPopup = typeof window !== 'undefined' &&
    !!window.opener &&
    window.opener !== window &&
    (window.name.indexOf("msal.") === 0 || window.location.hash.includes("code="));

  if (isMsalPopup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-main">
        <div className="animate-spin h-10 w-10 border-4 border-sky-500 border-t-transparent rounded-full mb-4"></div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Secure Handshake...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-main font-sans selection:bg-sky-500/30 transition-colors duration-500">
      <UnauthenticatedTemplate>
        {/* Only show LoginPage if no MSAL interaction is active */}
        {inProgress === InteractionStatus.None ? (
          <LoginPage />
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="animate-spin h-10 w-10 border-4 border-sky-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </UnauthenticatedTemplate>

      <AuthenticatedTemplate>
        <motion.div
          className="min-h-screen flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Header />

          {/* Navigation Tabs */}
          <div
            className="backdrop-blur-md border-b border-white/[0.06] px-8 flex relative z-40"
            style={{ backgroundColor: '#030a14' }}
          >
            <button
              onClick={() => setActiveTab('allocator')}
              style={{ color: activeTab === 'allocator' ? '#38bdf8' : '#94a3b8' }}
              className={`relative px-8 py-5 text-sm font-mono tracking-[0.2em] uppercase transition-all group hover:text-[#f8fafc]`}>
              <span className="relative z-10">⚗ Allocator</span>
              {activeTab === 'allocator' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              style={{ color: activeTab === 'fleet' ? '#38bdf8' : '#94a3b8' }}
              className={`relative px-8 py-5 text-sm font-mono tracking-[0.2em] uppercase transition-all group hover:text-[#f8fafc]`}>
              <span className="relative z-10">🚢 Fleet</span>
              {activeTab === 'fleet' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              style={{ color: activeTab === 'products' ? '#38bdf8' : '#94a3b8' }}
              className={`relative px-8 py-5 text-sm font-mono tracking-[0.2em] uppercase transition-all group hover:text-[#f8fafc]`}>
              <span className="relative z-10">📋 Products</span>
              {activeTab === 'products' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                />
              )}
            </button>
          </div>

          <main className="relative">
            <AnimatePresence mode="wait">
              {activeTab === 'allocator' && (
                <motion.div
                  key="allocator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <AllocatorTab activeTab="allocator" />
                </motion.div>
              )}

              {activeTab === 'fleet' && (
                <motion.div
                  key="fleet"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <FleetTab fleet={fleet} />
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <AllocatorTab activeTab="products" />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer / Status Bar */}
          <footer className="relative mt-auto h-12 bg-navy-950/80 backdrop-blur-lg border-t border-white/5 flex items-center px-6 justify-between z-40">
            <div className="flex items-center gap-6 text-[9px] font-mono uppercase tracking-[0.2em] text-muted">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
                <span>System Operational</span>
              </div>
              <span className="opacity-30">|</span>
              <span>API: Connected (localhost:8000)</span>
            </div>
            <div className="text-[9px] font-mono text-muted uppercase tracking-[0.2em]">
              Precision Logistics Engine · V2.0.1
            </div>
          </footer>
        </motion.div>
      </AuthenticatedTemplate>
    </div>
  );
}

export default App;
