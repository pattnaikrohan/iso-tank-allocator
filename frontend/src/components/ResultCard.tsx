import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import type { AllocationResult } from '../types';
import Tooltip from './Tooltip';
import LoadManifestModal from './LoadManifestModal';

interface ResultCardProps {
  result: AllocationResult;
  isBest: boolean;
  destination: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, isBest, destination }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    tankLabel,
    isViable,
    isBaffled,
    warnings,
    effectiveLimit,
    limitingFactor,
    minVol,
    minCargoKg,
    maxVol,
    maxCargoKg,
    maxGrossKg,
    maxFillPct,
    minFillPct,
    headroomKg,
    tankNotes,
  } = result;

  if (!isViable) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-6 opacity-30 grayscale cursor-not-allowed group overflow-hidden border-white/5 bg-black/20"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="font-bebas text-2xl tracking-wider text-muted">{tankLabel}</div>
          <div className="text-xs font-mono text-red-500 uppercase tracking-widest px-2 py-1 bg-red-500/5 rounded border border-red-500/10">Incompatible</div>
        </div>
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className="text-xs font-mono text-red-400/80 bg-red-400/5 border border-red-500/10 px-3 py-1.5 rounded flex items-center gap-2">
              <span className="text-xs">✕</span> {w}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  const maxGrossPct = (maxGrossKg / effectiveLimit) * 100;

  return (
    <>
      <motion.div 
        onClick={() => setIsModalOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.4, ease: "easeOut" } }}
        className={`glass-heavy group relative p-5 md:p-6 transition-all duration-700 cursor-pointer rounded-2xl ${
          isBest 
            ? 'shadow-[0_0_40px_rgba(16,185,129,0.15)]' 
            : 'hover:shadow-glow-sky shadow-soft-elevate'
        }`}
        style={{
          backgroundColor: isBest ? 'var(--card-best-bg)' : 'var(--card-bg)',
          border: '1px solid transparent',
          borderLeft: isBest ? '4px solid var(--green-text)' : '1px solid var(--card-border)'
        }}
      >
        {/* Glow Effects */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl pointer-events-none rounded-2xl ${
          isBest ? 'bg-emerald-500/5' : 'bg-sky-500/5'
        }`}></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="mb-4">
            {isBest && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-2"
              >
                <div className="h-[2px] w-8 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                <span className="font-mono text-[11px] tracking-[0.3em] text-emerald-400 font-bold uppercase drop-shadow-sm">
                  ✓ Recommended Optimal Load Yield
                </span>
              </motion.div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="font-bebas text-[2.25rem] tracking-[0.05em] text-main drop-shadow-sm leading-tight">
                {tankLabel}
              </div>
              {isBaffled && (
                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  Baffled
                </div>
              )}
            </div>
          </div>

          <div className="font-mono text-xs text-muted mb-4 flex items-center gap-3">
            <Tooltip content={effectiveLimit === 36000 ? 'Default Global Container Weight Standard' : `Regulatory road weight limit for ${destination}`}>
              <span className="uppercase tracking-[0.2em] cursor-help border-b border-dashed border-slate-600/60 pb-[1px] hover:text-sky-300 transition-colors">{effectiveLimit === 36000 ? 'World Standard' : `${destination} Limit`}</span>
            </Tooltip>
            <span className="w-8 h-[1px] bg-white/10"></span>
            <span className={effectiveLimit < 36000 ? 'text-orange-400/90 font-medium' : 'text-sky-400/90 font-medium'}>
              {effectiveLimit.toLocaleString()} kg max
            </span>
          </div>

          {/* Load Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 flex-1">
            {/* MIN Side */}
            <div 
              className="rounded-2xl p-4 transition-all duration-500 shadow-soft-inset relative overflow-hidden flex flex-col justify-center hover:opacity-90"
              style={{ backgroundColor: 'var(--card-inner-bg)' }}
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-sky-500/20 to-transparent"></div>
              <div className="text-[11px] font-mono tracking-[0.25em] text-sky-400 mb-3 flex items-center gap-2 opacity-80 uppercase font-semibold">
                <span className="w-1 h-3 bg-sky-500 rounded-sm"></span> Minimum Target ({minFillPct}%)
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm font-mono text-muted uppercase tracking-[0.2em] mb-1">Estimated Payload</span>
                  <span className="font-bebas text-4xl text-main leading-none tracking-wide">
                    {(minCargoKg / 1000).toFixed(3)} <span className="text-sm uppercase font-mono text-muted ml-1">MT</span>
                  </span>
                  <span className="text-sm font-mono text-muted/60 mt-1">{minCargoKg.toLocaleString()} kg</span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[11px] font-mono uppercase tracking-[0.2em] mb-1 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Required Volume</span>
                  <span className={`font-bebas text-2xl leading-none tracking-wide ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {(minVol / 1000).toFixed(3)} <span className={`text-xs uppercase font-mono ml-1 ${isLight ? 'text-slate-600' : 'text-slate-600'}`}>KL</span>
                  </span>
                </div>
              </div>
            </div>

            {/* MAX Side */}
            <div 
              className="rounded-2xl p-4 transition-all duration-500 shadow-soft-inset relative overflow-hidden flex flex-col justify-center hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--card-inner-bg)',
                borderLeft: isBest ? '3px solid var(--green-text)' : 'none'
              }}
            >
              <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r to-transparent ${isBest ? 'from-emerald-400/80' : 'from-emerald-500/20'}`}></div>
              <div className="text-[11px] font-mono tracking-[0.25em] text-emerald-400 mb-3 flex items-center gap-2 opacity-90 uppercase font-semibold">
                <span className="w-1 h-3 bg-emerald-500 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span> Maximum Yield ({maxFillPct}%)
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm font-mono text-slate-500 uppercase tracking-[0.2em] mb-1">Calculated Payload</span>
                  <span className="font-bebas text-[2.25rem] text-emerald-400 leading-none tracking-wide drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                    {(maxCargoKg / 1000).toFixed(3)} <span className="text-sm uppercase font-mono text-emerald-500/50 ml-1">MT</span>
                  </span>
                  <span className="text-sm font-mono text-emerald-500/50 mt-1">{maxCargoKg.toLocaleString()} kg</span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[11px] font-mono uppercase tracking-[0.2em] mb-1 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Theoretical Volume</span>
                  <span className={`font-bebas text-2xl leading-none tracking-wide ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
                    {(maxVol / 1000).toFixed(3)} <span className={`text-xs uppercase font-mono ml-1 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>KL</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Visualization */}
          <div className="mt-auto space-y-4">
            
            {/* Fill Range Spectrum Bar */}
            <div>
              <div className={`font-mono text-[11px] mb-2 flex justify-between tracking-[0.2em] uppercase ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
                <span>Fill Boundary Spectrum</span>
                <span><span className="text-sky-400 font-bold">{minFillPct}%</span> MIN → <span className="text-emerald-400 font-bold">{maxFillPct}%</span> MAX <span className="text-slate-600 mx-1">|</span> Span: <span className={isLight ? 'text-slate-500' : 'text-slate-300'}>{(maxFillPct - minFillPct).toFixed(1)}%</span></span>
              </div>
              <div className="relative h-2 bg-navy-700/20 rounded-full mt-2 mb-1.5 overflow-visible">
                <div 
                  className="absolute h-full rounded-full bg-gradient-to-r from-sky-500/50 to-emerald-500/80" 
                  style={{ left: `${minFillPct}%`, width: `${Math.max(0, maxFillPct - minFillPct)}%` }}
                />
                <div 
                  className="absolute top-[-3px] w-0.5 h-3.5 bg-sky-400 rounded-sm shadow-[0_0_8px_rgba(56,189,248,0.8)]" 
                  style={{ left: `${minFillPct}%`, transform: "translateX(-50%)" }}
                />
                <div 
                  className="absolute top-[-3px] w-0.5 h-3.5 bg-emerald-400 rounded-sm shadow-[0_0_8px_rgba(52,211,153,0.8)]" 
                  style={{ left: `${Math.min(maxFillPct, 99.5)}%`, transform: "translateX(-50%)" }}
                />
              </div>
               <div className={`flex justify-between font-mono text-[11px] mb-4 ${isLight ? 'text-slate-500' : 'text-slate-600'}`}>
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>

            <div 
              className="rounded-xl p-4 shadow-inner relative shadow-soft-inset"
              style={{ backgroundColor: 'var(--card-inner-bg)' }}
            >
               <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[11px] font-mono text-muted uppercase tracking-[0.25em]">Weight Compliance</span>
                    <span className="text-xs font-mono text-main font-medium">{maxGrossKg.toLocaleString()} <span className="text-muted/60">/ {effectiveLimit.toLocaleString()} kg</span></span>
                  </div>
                  
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden flex shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(maxGrossPct, 100)}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                      className={`h-full rounded-full ${maxGrossPct > 99 ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]' : 'bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.8)]'}`}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.05]">
                    <span className={`text-[11px] font-mono uppercase tracking-[0.2em] ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Limiting Factor</span>
                    <Tooltip content={limitingFactor === 'Weight Restricted' ? 'Yield is capped by regional road weight limit' : 'Yield is capped by safe volume boundary'}>
                      <span className="text-[11px] font-mono text-sky-400 uppercase tracking-[0.2em] bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 font-semibold cursor-help">{limitingFactor}</span>
                    </Tooltip>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Tooltip content={headroomKg > 0 ? `Can fit ${headroomKg.toLocaleString()} kg more weight before capacity` : 'Absolute weight capacity reached'}>
                <div className={`text-[11px] font-mono uppercase tracking-[0.2em] px-4 py-2 rounded-lg border font-semibold cursor-help transition-colors ${
                  headroomKg < 200 ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20'
                }`}>
                  {headroomKg.toLocaleString()} kg headroom
                </div>
              </Tooltip>
              {warnings.map((w, i) => (
                <div key={i} className="text-[11px] font-mono uppercase tracking-[0.2em] px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-semibold shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  ⚠ {w}
                </div>
              ))}
            </div>

            <div className={`mt-4 pt-4 border-t border-white/5 text-[11px] font-mono tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
              {tankNotes}
            </div>
          </div>
        </div>
      </motion.div>

      <LoadManifestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resultData={result}
        destination={destination}
      />
    </>
  );
};

export default ResultCard;
