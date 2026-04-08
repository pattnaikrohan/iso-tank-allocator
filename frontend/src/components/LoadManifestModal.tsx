import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { AllocationResult } from '../types';

interface LoadManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultData: AllocationResult;
  destination: string;
}

const LoadManifestModal: React.FC<LoadManifestModalProps> = ({ isOpen, onClose, resultData, destination }) => {
  const hasData = !!resultData;
  const renderData = resultData || {} as AllocationResult;

  const {
    tankLabel,
    effectiveLimit,
    limitingFactor,
    maxLimitedByWeight,
    maxVol,
    maxCargoKg,
    maxGrossKg,
    maxFillPct,
    headroomKg,
    warnings
  } = renderData;

  const capacityL = Math.round((maxVol || 0) / ((maxFillPct || 100) / 100));
  const tareKg = (maxGrossKg || 0) - (maxCargoKg || 0);
  const headroomL = capacityL - (maxVol || 0);

  const fillPercentage = (((maxVol || 0) / capacityL) * 100).toFixed(1);
  const requiresBaffle = parseFloat(fillPercentage) < 80;

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && hasData && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border overflow-hidden shadow-2xl manifest-modal"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            {/* Print-Only Header */}
            <div className="hidden print-only-header mb-8 border-b-2 border-sky-500 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bebas text-4xl text-black">AAW <span className="text-sky-600">BULK LIQUID</span> LOGISTICS</div>
                  <div className="text-xs font-mono tracking-widest text-slate-500 uppercase">Official Load Manifest · Generated {new Date().toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-400 uppercase">Compliance Vector: ISO-T11-PRO</div>
                  <div className="text-xs font-bold text-sky-600">AUTHORIZED DOCUMENT</div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div 
              className="px-8 py-6 border-b flex justify-between items-center no-print"
              style={{ backgroundColor: 'var(--card-inner-bg)', borderColor: 'var(--card-border)' }}
            >
              <div>
                <div className="font-bebas text-3xl text-main tracking-wider">{tankLabel} <span className="text-sky-500 ml-2">DATA MANIFEST</span></div>
                <div className="text-xs font-mono tracking-widest text-muted mt-1 uppercase">Advanced Load Analytics</div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrint}
                  className="p-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 rounded-xl transition-all border border-sky-500/20 flex items-center gap-2 px-4 group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest">Print</span>
                </button>
                <button onClick={onClose} className="p-2 hover:bg-navy-700/20 rounded-xl transition-colors text-muted hover:text-main">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Real Data Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-mono text-sky-400 uppercase tracking-widest border-b border-sky-500/10 pb-2 drop-shadow-sm">Load Variables</h3>
                  
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Tare Weight</span>
                    <span className="font-mono text-sm text-slate-300">{tareKg.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Gross Limit ({destination})</span>
                    <span className="font-mono text-sm text-slate-300">{effectiveLimit.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Tank Capacity</span>
                    <span className="font-mono text-sm text-slate-300">{capacityL.toLocaleString()} L</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Max Fill Boundary</span>
                    <span className="font-mono text-sm text-slate-300">{maxFillPct}%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-widest border-b border-emerald-500/10 pb-2 drop-shadow-sm">Yield Results</h3>
                  
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider">Net Payload</span>
                    <span className="font-mono text-sm font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{maxCargoKg.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider">Gross Mass</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">{maxGrossKg.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider">Fill Volume</span>
                    <span className="font-mono text-sm text-main">{maxVol.toLocaleString()} L ({fillPercentage}%)</span>
                  </div>
                </div>
              </div>

              {/* Limiting Factor Analysis */}
              <div 
                className="rounded-xl p-5 border shadow-inner"
                style={{ backgroundColor: 'var(--card-inner-bg)', borderColor: 'var(--card-border)' }}
              >
                 <h3 className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-3">Constraint Resolution</h3>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)] animate-pulse"></div>
                     <span className="font-mono text-sm text-white uppercase tracking-wider">{limitingFactor}</span>
                   </div>
                   <div className="text-right">
                     {maxLimitedByWeight ? (
                       <div className="text-xs font-mono text-slate-400">Yield constrained by Road Gross Limit. <strong className="text-sky-400">Volumetric Headroom: {headroomL.toLocaleString()} L</strong></div>
                     ) : (
                       <div className="text-xs font-mono text-slate-400">Yield constrained by {maxFillPct}% Safety Boundary. <strong className="text-emerald-400">Mass Headroom: {headroomKg.toLocaleString()} kg</strong></div>
                     )}
                   </div>
                 </div>
              </div>

              {/* Explicit Warnings Container from Real Data */}
              <div className="flex flex-wrap gap-2">
                {requiresBaffle && (
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    ⚠ Baffles Required for Stability (Fill &lt; 80%)
                  </div>
                )}
                {warnings.map((w, i) => (
                  <div key={i} className="text-[11px] font-mono uppercase tracking-[0.2em] px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-semibold shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    ⚠ {w}
                  </div>
                ))}
                {headroomKg < 500 && maxLimitedByWeight && (
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold">
                    ⚠ Approaching Max Weight Limit
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default LoadManifestModal;
