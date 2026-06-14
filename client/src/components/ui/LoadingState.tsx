import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Memuat data...' }) => {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
      <Loader2 size={40} className="animate-spin opacity-20" />
      <p className="text-[13px] font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingState;
