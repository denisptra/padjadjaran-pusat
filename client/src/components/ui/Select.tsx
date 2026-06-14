import React from 'react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  containerClassName?: string;
  options?: { label: string; value: string | number }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, containerClassName, label, error, helper, options, children, ...props }, ref) => {
    const generatedId = React.useId();
    const id = props.id || generatedId;

    return (
      <div className={cn("w-full space-y-1.5 text-left", containerClassName)}>
        {label && (
          <label htmlFor={id} className="text-[12px] sm:text-[13px] font-semibold text-gray-700 normal-case ml-1 block">
            {label.includes('*') ? (
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
        <select
          ref={ref}
          id={id}
          name={props.name || id}
          className={cn(
            "w-full h-9 sm:h-10 px-4 bg-white border border-gray-200 rounded-md text-[12px] sm:text-[13px] font-medium font-inter transition-all outline-none",
            "focus:border-[#DCAF01] focus:ring-4 focus:ring-[#DCAF01]/5 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/5",
            className
          )}
          {...props}
        >
          {options ? options.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          )) : children}
        </select>
        {error && <p className="text-[11px] text-red-500 font-medium ml-1">{error}</p>}
        {helper && <p className="text-[11px] text-gray-400 font-medium ml-1">{helper}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;


