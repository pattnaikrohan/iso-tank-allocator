import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TabType } from '../App';

interface TutorialStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  tab?: TabType;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    targetId: 'root',
    title: 'Welcome to ISO Tank Allocator',
    description: 'This interactive tool helps you calculate optimal payload and compliance bounds for ISO tank operations.',
    position: 'center'
  },
  {
    id: 'tabs',
    targetId: 'tutorial-tabs',
    title: 'Navigation Control',
    description: 'Switch between the Allocator (calculation), Fleet (asset specs), and Products (chemical directory).',
    position: 'bottom'
  },
  {
    id: 'product-select',
    targetId: 'tutorial-sidebar',
    title: 'Operational Parameters',
    description: 'Select products, specify density (SG), and choose destinations to see real-time weight limits.',
    position: 'right',
    tab: 'allocator'
  },
  {
    id: 'ai-analysis',
    targetId: 'tutorial-ai-advisor',
    title: 'AI Operations Advisor',
    description: 'Run deep-vector analysis to get risk assessment and yield optimization strategies.',
    position: 'bottom',
    tab: 'allocator'
  },
  {
    id: 'results',
    targetId: 'tutorial-results',
    title: 'Yield Optimization Cards',
    description: 'Each card shows minimum and maximum safe loads. Click any card to generate a professional Load Manifest.',
    position: 'left',
    tab: 'allocator'
  }
];

interface TutorialPortalProps {
  onClose: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TutorialPortal: React.FC<TutorialPortalProps> = ({ onClose, activeTab, setActiveTab }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<{ top: number; left: number; width: number; height: number; opacity: number }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const [cardPos, setCardPos] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  const currentStep = TUTORIAL_STEPS[currentStepIndex];

  const updatePosition = useCallback(() => {
    const step = TUTORIAL_STEPS[currentStepIndex];
    
    if (step.targetId === 'root') {
      setSpotlightRect({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, opacity: 0 });
      setCardPos({ top: '35%', left: '50%', transform: 'translate(-50%, -35%)' });
      return;
    }

    const element = document.getElementById(step.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      
      if (rect.width === 0 || rect.height === 0) {
        setTimeout(updatePosition, 100);
        return;
      }

      setSpotlightRect({
        top: rect.top - 12,
        left: rect.left - 12,
        width: rect.width + 24,
        height: rect.height + 24,
        opacity: 0.95
      });
      
      const cardWidth = 340;
      const cardHeight = 400; // Estimated height
      let top = 0;
      let left = 0;

      // Logic to prevent "hiding under the page" (viewport collision)
      if (step.position === 'bottom') {
        top = rect.bottom + 24;
        left = rect.left;
        if (top + cardHeight > window.innerHeight) {
          top = rect.top - cardHeight - 24; // Flip to top if no space
        }
      } else if (step.position === 'top') {
        top = rect.top - cardHeight - 24;
        left = rect.left;
        if (top < 0) top = rect.bottom + 24;
      } else if (step.position === 'right') {
        top = rect.top;
        left = rect.right + 24;
        if (left + cardWidth > window.innerWidth) {
          left = rect.left - cardWidth - 24;
        }
      } else if (step.position === 'left') {
        top = rect.top;
        left = rect.left - cardWidth - 24;
        if (left < 0) left = rect.right + 24;
      }

      // Final Viewport Constraints (Keep inside 20px padding)
      const padding = 20;
      top = Math.max(padding, Math.min(top, window.innerHeight - cardHeight - padding));
      left = Math.max(padding, Math.min(left, window.innerWidth - cardWidth - padding));

      setCardPos({ top: `${top}px`, left: `${left}px`, transform: 'none' });

      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStepIndex]);

  useEffect(() => {
    if (currentStep.tab && activeTab !== currentStep.tab) {
      setActiveTab(currentStep.tab);
      setTimeout(updatePosition, 300);
    } else {
      updatePosition();
    }
  }, [currentStepIndex, activeTab, updatePosition, setActiveTab, currentStep.tab]);

  useEffect(() => {
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    const interval = setInterval(updatePosition, 1000);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearInterval(interval);
    };
  }, [updatePosition]);

  const handleNext = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      {/* Dimmed Backdrop with Spotlight Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.8))' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <motion.rect
              initial={false}
              animate={{
                x: spotlightRect.left,
                y: spotlightRect.top,
                width: spotlightRect.width,
                height: spotlightRect.height,
                rx: 24
              }}
              transition={{ type: "spring", damping: 30, stiffness: 120 }}
              fill="black"
            />
          </mask>
        </defs>
        <rect 
          x="0" y="0" width="100%" height="100%" 
          fill="black" 
          opacity={0.65} 
          mask="url(#spotlight-mask)" 
          className="transition-opacity duration-500"
          onClick={onClose} 
        />
        {/* Spotlight Glow Border for clarity */}
        {currentStep.targetId !== 'root' && (
          <motion.rect
            initial={false}
            animate={{
              x: spotlightRect.left,
              y: spotlightRect.top,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
            transition={{ type: "spring", damping: 30, stiffness: 120 }}
            fill="none"
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="3"
            rx="24"
            className="pointer-events-none"
          />
        )}
      </svg>

      {/* Popover Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="absolute z-[1001] pointer-events-auto"
          style={cardPos}
        >
          <div 
            ref={cardRef}
            className="glass-heavy p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/30 shadow-[0_40px_120px_rgba(0,0,0,0.7)] relative overflow-hidden backdrop-blur-3xl max-h-[85vh] overflow-y-auto"
            style={{ width: 'min(340px, 90vw)' }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/20 blur-[60px] -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[40px] -z-10" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono tracking-[0.4em] text-sky-400 uppercase font-black mb-1">
                  Onboarding Vector
                </span>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
                  Step {currentStepIndex + 1} // {TUTORIAL_STEPS.length}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-500 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <h3 className="font-bebas text-2xl md:text-3xl text-white mb-2 tracking-wider uppercase leading-tight">{currentStep.title}</h3>
            <p className="text-[14px] text-slate-300 font-sans leading-relaxed mb-8 opacity-90">
              {currentStep.description}
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex gap-2 w-full">
                {currentStepIndex > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex-shrink-0 p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-grow py-3.5 bg-gradient-to-r from-sky-500 to-sky-300 hover:from-sky-400 hover:to-sky-200 text-white font-mono text-[10px] md:text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_15px_40px_rgba(14,165,233,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {currentStepIndex === TUTORIAL_STEPS.length - 1 ? 'Engage System' : 'Acknowledge'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 hover:text-red-400 transition-colors font-bold text-center"
              >
                Skip Interface Guidance
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TutorialPortal;
