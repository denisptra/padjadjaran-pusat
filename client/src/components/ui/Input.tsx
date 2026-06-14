import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  as?: 'input' | 'textarea';
  rows?: number;
}

const Input = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  ({ className, label, error, helper, icon, rightElement, as = 'input', ...props }, ref) => {
    const isTextarea = as === 'textarea';
    const Component = as as any;
    const generatedId = React.useId();
    const id = props.id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={id} className="text-[12px] sm:text-[13px] font-semibold text-gray-700 normal-case ml-1 block">
            {typeof label === 'string' && label.includes('*') ? (
              <>
                {label.split('*')[0]}
                <span className="text-red-500">*</span>
                {label.split('*')[1]}
              </>
            ) : (
              label
            )}
          </label>
        )}
        <div className="relative group">
          {icon && !isTextarea && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#DCAF01] transition-colors flex items-center justify-center">
              {icon}
            </div>
          )}
          <Component
            ref={ref}
            id={id}
            name={props.name || id}
            className={cn(
              "w-full bg-white border border-gray-200 rounded-md text-[12px] sm:text-[13px] font-medium font-inter transition-all outline-none",
              "focus:border-[#DCAF01] focus:ring-4 focus:ring-[#DCAF01]/5 placeholder:text-gray-400 placeholder:font-normal hover:border-gray-400",
              isTextarea ? "py-3 px-4 min-h-[100px]" : "h-9 sm:h-10 px-4",
              icon && !isTextarea && "pl-11",
              rightElement && !isTextarea && "pr-11",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/5",
              className
            )}
            {...props}
          />
          {rightElement && !isTextarea && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] text-red-500 font-medium ml-1">{error}</p>}
        {helper && <p className="text-[11px] text-gray-400 font-medium ml-1">{helper}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;


