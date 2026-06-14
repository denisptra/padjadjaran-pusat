import React from 'react';
import { cn } from '../../utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down';
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  variant = 'primary',
  className 
}) => {
  const variants = {
    primary: 'text-[#DCAF01] bg-[#DCAF01]/5 border-[#DCAF01]/10',
    success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
    danger: 'text-red-600 bg-red-50 border-red-100',
    info: 'text-blue-600 bg-blue-50 border-blue-100',
    gray: 'text-gray-600 bg-gray-50 border-gray-100',
  };

  return (
    <div className={cn("bg-white border border-gray-200 rounded-md p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[12px] font-normal text-gray-500 tracking-normal">{title}</p>
          <div className="text-[22px] md:text-[24px] font-semibold text-gray-900 leading-none">{value}</div>
          
          {(description || trend) && (
            <div className="flex items-center gap-1.5 pt-1">
              {trend && (
                <span className={cn(
                  "flex items-center text-[11px] font-semibold",
                  trend === 'up' ? "text-emerald-600" : "text-red-600"
                )}>
                  {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </span>
              )}
              {description && (
                <p className="text-[11px] text-gray-400 font-normal">{description}</p>
              )}
            </div>
          )}
        </div>
        
        <div className={cn(
          "h-10 w-10 rounded-md flex items-center justify-center border",
          variants[variant]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

