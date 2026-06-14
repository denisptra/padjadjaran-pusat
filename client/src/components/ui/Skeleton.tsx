import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect' }) => {
  return (
    <div 
      className={cn(
        " bg-stone-200/60 dark:bg-stone-800",
        variant === 'circle' ? 'rounded-md' : 'rounded-md',
        className
      )}
    />
  );
};

export default Skeleton;

