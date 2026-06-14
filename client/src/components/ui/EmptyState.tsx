import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = <Inbox size={40} className="text-gray-200" />, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="lte-card">
       <div className="lte-card-body flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="h-16 w-16 bg-gray-50 rounded flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
            {icon}
          </div>
          <h3 className="text-lg font-normal text-gray-800 mb-2">
            {title}
          </h3>
          <p className="text-[13px] text-gray-500 max-w-sm mb-8 leading-relaxed">
            {description}
          </p>
          {actionLabel && onAction && (
            <Button onClick={onAction} variant="primary" size="sm">
              <Plus size={14} className="mr-1.5" strokeWidth={3} /> {actionLabel}
            </Button>
          )}
       </div>
    </div>
  );
};

export default EmptyState;

