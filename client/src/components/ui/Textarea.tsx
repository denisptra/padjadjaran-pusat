import React from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  helper?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helper, ...props }, ref) => {
    const generatedId = React.useId();
    const id = props.id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={id} className="text-[12px] sm:text-[13px] font-medium text-gray-700 normal-case ml-0.5 block">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          name={props.name || id}
          className={cn(
            "w-full bg-white border border-gray-300 rounded-md text-[12px] sm:text-[13px] font-normal font-inter transition-all outline-none py-3 px-4 min-h-[100px]",
            "focus:border-[#DCAF01] focus:ring-4 focus:ring-[#DCAF01]/5 placeholder:text-gray-400 placeholder:font-normal hover:border-gray-400",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/5",
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-red-500 font-medium ml-1">{error}</p>}
        {helper && <p className="text-[11px] text-gray-400 font-medium ml-1">{helper}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
