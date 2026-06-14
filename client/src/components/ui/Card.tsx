import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, title, subtitle, action, className, noPadding = false, onClick }) => {
  return (
    <div 
      className={cn("bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden", className)}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && <h3 className="text-[13px] sm:text-[14px] md:text-[15px] font-semibold text-gray-900 leading-tight">{title}</h3>}
            {subtitle && <p className="text-[11px] sm:text-[12px] text-gray-500 mt-0.5 font-normal">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(noPadding ? "" : "p-4 sm:p-5")}>
        {children}
      </div>
    </div>
  );
};

export default Card;

