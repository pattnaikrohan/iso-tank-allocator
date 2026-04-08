import React, { type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  return (
    <div className="group/tooltip relative flex items-center justify-center">
      {children}
      <div className={`absolute whitespace-nowrap px-4 py-2 glass-heavy rounded-lg text-[10px] font-mono text-slate-300 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-2xl border border-white/10 ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      }`}>
        {content}
      </div>
    </div>
  );
};

export default Tooltip;
