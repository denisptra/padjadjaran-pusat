import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { X } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           {children}
        </div>
        
        <div className="flex justify-end pt-6 border-t border-gray-100">
          {footer || (
            <Button variant="white" onClick={onClose} className="border-gray-200">
              Tutup
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DetailModal;
