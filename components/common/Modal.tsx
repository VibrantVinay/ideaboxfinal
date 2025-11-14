
import React from 'react';
import { CloseIcon } from '../../constants';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-light-card dark:bg-dark-card w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl p-6 relative flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto pr-2 -mr-2">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
