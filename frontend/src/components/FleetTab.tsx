import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import type { Tank } from '../types';

interface FleetTabProps {
  fleet: Tank[];
}

const SG_SAMPLES = [0.79, 0.90, 1.00, 1.10, 1.20, 1.40, 1.60, 1.84];

const FleetTab: React.FC<FleetTabProps> = ({ fleet }) => {
  const { theme } = useTheme();
  const WW_GVW_KG = 36000;
  const NA_LIMIT = 23995;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 lg:p-12 min-h-screen"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="font-bebas text-5xl text-main mb-2 tracking-widest drop-shadow-md">T11 Fleet Intelligence</h2>
          <div className="flex items-center gap-4 text-sm font-mono tracking-[0.2em] uppercase">
            <span className={theme === 'light' ? 'text-slate-600' : 'text-muted'}>Standardized Food & Industrial Assets</span>
            <span className="opacity-30">|</span>
            <span className={theme === 'light' ? 'text-sky-600' : 'text-sky-400/80'}>Global Port & Road Compliance Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {fleet.map((tank) => {
            const naCargo = NA_LIMIT - tank.tare;
            const wwCargo = WW_GVW_KG - tank.tare;

            return (
              <motion.div 
                key={tank.id}
                whileHover={{ y: -5, scale: 1.01 }}
                className="rounded-2xl p-8 relative overflow-hidden group transition-all duration-300"
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  border: theme === 'light' ? '1.5px solid rgba(14, 165, 233, 0.4)' : '1px solid var(--card-border)',
                  boxShadow: theme === 'light' 
                    ? `0 35px 70px -15px rgba(12, 74, 110, 0.25), 0 20px 40px -20px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.5), 0 0 30px rgba(14, 165, 233, 0.15)`
                    : `var(--panel-shadow), 0 0 60px rgba(124, 58, 237, 0.15), 0 0 30px rgba(14, 165, 233, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.05)`
                }}
              >
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[80px] -z-10 group-hover:bg-sky-500/20 transition-all duration-500" />
                
                <div className="mb-6">
                  <h3 className="font-bebas text-3xl text-sky-400 tracking-wider mb-1">{tank.label}</h3>
                  <p className="text-sm font-mono text-muted uppercase tracking-[0.15em] font-semibold">T11 · Food & Industrial Grade</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)', opacity: 0.8 }}>
                    <span className="text-sm font-mono text-muted uppercase tracking-widest">Tank Capacity</span>
                    <span className="text-base font-semibold text-main">{tank.size.toLocaleString()} L</span>
                  </div>
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)', opacity: 0.8 }}>
                    <span className="text-sm font-mono text-muted uppercase tracking-widest">Tare (Typical)</span>
                    <span className="text-base font-semibold text-main">{tank.tare.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)', opacity: 0.8 }}>
                    <span className={`text-sm font-mono uppercase tracking-widest ${theme === 'light' ? 'text-orange-700' : 'text-orange-400/80'}`}>⚖ NA Gross limit</span>
                    <span className={`text-base font-semibold ${theme === 'light' ? 'text-orange-600' : 'text-orange-300'}`}>{NA_LIMIT.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--card-border)', opacity: 0.8 }}>
                    <span className={`text-sm font-mono uppercase tracking-widest ${theme === 'light' ? 'text-sky-700' : 'text-sky-400/80'}`}>🌍 WW Gross limit</span>
                    <span className={`text-base font-semibold ${theme === 'light' ? 'text-sky-600' : 'text-sky-300'}`}>{WW_GVW_KG.toLocaleString()} kg</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-mono text-muted uppercase tracking-widest mb-2 pb-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <span>SG</span>
                    <div className="flex gap-4">
                      <span className="text-orange-400/50">NA (KL)</span>
                      <span className="text-sky-400/50">WW (KL)</span>
                    </div>
                  </div>
                  {SG_SAMPLES.map((sg) => {
                    const vNA = naCargo / sg;
                    const vWW = wwCargo / sg;
                    const exceedsNA = vNA > tank.size;
                    const exceedsWW = vWW > tank.size;

                    return (
                      <div key={sg} className="flex justify-between items-center font-mono text-xs">
                        <span className="text-muted">{sg.toFixed(2)}</span>
                        <div className="flex gap-4 text-right">
                          <span className={`w-14 ${exceedsNA ? 'text-red-400/60' : 'text-orange-300'}`}>
                            {exceedsNA ? 'CAPACITY' : (vNA / 1000).toFixed(2)}
                          </span>
                          <span className={`w-14 ${exceedsWW ? 'text-red-400/60' : 'text-sky-300'}`}>
                            {exceedsWW ? 'CAPACITY' : (vWW / 1000).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-2xl border border-orange-500/10 shadow-soft-inset">
            <h4 className="font-bebas text-2xl text-orange-400 tracking-widest mb-4 uppercase">⚖ Restricted Markets · Road Compliance</h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs font-mono text-muted leading-relaxed uppercase">
              <div>
                <span className="text-muted block mb-1">USA / CANADA</span>
                <span className="text-orange-300 font-bold">23,995 KG</span>
              </div>
              <div>
                <span className="text-muted block mb-1">MEXICO</span>
                <span className="text-orange-300 font-bold">24,000 KG</span>
              </div>
              <div>
                <span className="text-muted block mb-1">AUSTRALIA / NZ</span>
                <span className="text-orange-300 font-bold">26,000 KG</span>
              </div>
              <div>
                <span className="text-muted block mb-1">JAPAN / TAIWAN</span>
                <span className="text-orange-300 font-bold">28,000 KG</span>
              </div>
              <div>
                <span className="text-muted block mb-1">CN / KR / IN / PK</span>
                <span className="text-orange-300 font-bold">30,000 KG</span>
              </div>
              <div>
                <span className="text-muted block mb-1">MYANMAR</span>
                <span className="text-red-400 font-bold">21,000 KG</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl border border-sky-500/10 shadow-soft-inset flex flex-col justify-between">
            <div>
              <h4 className="font-bebas text-2xl text-sky-400 tracking-widest mb-4 uppercase">🌍 Unrestricted · Structural Maximum</h4>
              <p className="text-sm font-mono text-muted leading-loose uppercase">
                Tank structural max: <strong className="text-sky-300 text-base">36,000 kg gross</strong><br/>
                Applies to: Europe, Middle East, SE Asia, Africa, South America<br/>
                Typical local road limits (40t+) exceed tank capacity.
              </p>
            </div>
            <p className="mt-6 text-[11px] font-mono text-slate-500 italic uppercase tracking-wider">
              ⚠ Verify local axle weight laws for the last-mile transport.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FleetTab;
