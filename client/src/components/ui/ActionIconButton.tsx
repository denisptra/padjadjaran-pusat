import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ActionIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  variant?: 'primary' | 'warning' | 'danger' | 'success' | 'gray';
}

export const ActionIconButton: React.FC<ActionIconButtonProps> = ({ icon: Icon, label, variant = 'primary', className, ...props }) => {
  const styles = {
    primary: "text-blue-600 hover:bg-blue-50",
    warning: "text-amber-600 hover:bg-amber-50",
    danger: "text-red-600 hover:bg-red-50",
    success: "text-emerald-600 hover:bg-emerald-50",
    gray: "text-gray-600 hover:bg-gray-50"
  };

  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-40",
        styles[variant],
        className
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};
