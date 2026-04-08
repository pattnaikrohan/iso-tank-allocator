import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-auto" }) => {
  return (
    <img 
      src="/logo.png" 
      alt="AAW Bulk Liquid Logistics" 
      className={`${className} object-contain`} 
      style={{ 
        filter: 'drop-shadow(0 0 1px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))'
      }} 
    />
  );
};

export default Logo;
