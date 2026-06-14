import React from 'react';
import { useToastStore } from '../../stores/toastStore';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={18} />,
    error: <XCircle className="text-red-500" size={18} />,
    info: <Info className="text-blue-500" size={18} />,
    warning: <AlertCircle className="text-amber-500" size={18} />,
  };

  const colors = {
    success: "border-emerald-100 bg-white shadow-emerald-500/5",
    error: "border-red-100 bg-white shadow-red-500/5",
    info: "border-blue-100 bg-white shadow-blue-500/5",
    warning: "border-amber-100 bg-white shadow-amber-500/5",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-3 min-w-[320px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "flex items-center gap-3 p-4 rounded-md border shadow-xl",
              colors[toast.type]
            )}
          >
            <div className="shrink-0">
              {icons[toast.type]}
            </div>
            <p className="text-[13px] font-medium text-gray-900 flex-1">
              {toast.message}
            </p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors border-0 bg-transparent p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

