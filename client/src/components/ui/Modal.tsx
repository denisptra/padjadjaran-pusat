import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideHeader?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  hideHeader = false
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-[6px]"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999 }}
    >
      <div className={cn(
        "bg-white rounded-md shadow-2xl w-full overflow-hidden flex flex-col max-h-[90vh] relative",
        sizes[size]
      )}>
        {!hideHeader && (
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-0 cursor-pointer p-1"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {footer && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;

