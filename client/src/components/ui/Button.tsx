import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline' | 'white' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  icon,
  className,
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#DCAF01] text-gray-900 hover:bg-[#C49C00] shadow-sm',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm',
    dark: 'bg-[#111827] text-white hover:bg-[#0F172A] shadow-sm',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
    white: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  };

  const sizes = {
    xs: 'h-7 sm:h-8 px-2.5 sm:px-3 text-[10px] sm:text-[11px]',
    sm: 'h-[30px] sm:h-8 px-3 text-[11px] sm:text-[12px]',
    md: 'h-9 sm:h-10 px-4 sm:px-5 text-[12px] sm:text-[13px]',
    lg: 'h-10 sm:h-11 px-6 sm:px-8 text-[13px] sm:text-[14px]',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none border-0 cursor-pointer gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Memproses...
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;

