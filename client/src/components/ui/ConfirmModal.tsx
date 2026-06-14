import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, HelpCircle, X, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'danger',
  isLoading = false
}) => {
  const variantStyles = {
    danger: {
      icon: "text-red-600 bg-red-50",
      btn: "bg-red-600 hover:bg-red-700 text-white shadow-red-200",
      border: "border-red-100"
    },
    warning: {
      icon: "text-amber-600 bg-amber-50",
      btn: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200",
      border: "border-amber-100"
    },
    primary: {
      icon: "text-[#DCAF01] bg-[#DCAF01]/5",
      btn: "bg-[#DCAF01] hover:bg-[#C49C00] text-gray-900 shadow-amber-100",
      border: "border-amber-50"
    }
  };

  const style = variantStyles[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      hideHeader
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="white" onClick={onClose} disabled={isLoading} className="flex-1 h-12 font-semibold border-gray-200 text-gray-500">
            {cancelLabel}
          </Button>
          <Button 
            className={cn("flex-1 h-12 font-semibold border-0 shadow-xl uppercase tracking-wider text-[12px]", style.btn)}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center py-6">
        {/* Decorative background icon */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gray-50/50 -z-10 border-b border-gray-100" />
        
        <div className={cn(
          "h-24 w-24 rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white relative z-10", 
          style.icon
        )}>
          {variant === 'danger' ? (
            <ShieldAlert size={48} strokeWidth={2.5} />
          ) : variant === 'warning' ? (
            <AlertTriangle size={48} strokeWidth={2.5} />
          ) : (
            <HelpCircle size={48} strokeWidth={2.5} />
          )}
        </div>
        
        <div className="space-y-3 relative z-10 px-2">
          <h4 className="text-[20px] font-semibold text-gray-900 uppercase tracking-tight leading-tight">
            {title}
          </h4>
          <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

