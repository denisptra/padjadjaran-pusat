import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ModalForm: React.FC<ModalFormProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999 }}
    >
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-[6px]" onClick={onClose} />
      <div className={cn("relative w-full bg-white rounded-md shadow-2xl flex flex-col border border-gray-100 z-10 max-h-[90vh]", sizes[size])}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-md">
          <h3 className="text-base font-semibold text-gray-900 leading-none">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors border-0 bg-transparent cursor-pointer"><X size={20} /></button>
        </div>
        <div className="flex-1 px-6 py-6 overflow-y-auto no-scrollbar">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-md">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default ModalForm;

