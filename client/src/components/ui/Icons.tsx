import React from 'react';
import { cn } from '../../utils/cn';

interface GoogleIconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export const GoogleIcon: React.FC<GoogleIconProps> = ({ name, className, size = 24 }) => {
  return (
    <span 
      className={cn("material-icons-outlined select-none", className)}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
};

