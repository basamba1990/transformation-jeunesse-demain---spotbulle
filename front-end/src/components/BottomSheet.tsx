import React from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
  return (
    <>
      {/* Overlay de fond */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white dark:bg-dark-surface rounded-t-xl shadow-lg max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white dark:bg-dark-surface z-10 flex items-center justify-between p-4 border-b dark:border-dark-border">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-border text-neutral-500 dark:text-neutral-400"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
