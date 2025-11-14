import React, { useEffect, useState } from 'react';
import type { ToastType } from '../../types';
import { CheckCircleIcon, XCircleIcon, InfoCircleIcon, CloseIcon } from '../../constants';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: CheckCircleIcon,
    bgClass: 'bg-green-500',
  },
  error: {
    icon: XCircleIcon,
    bgClass: 'bg-red-500',
  },
  info: {
    icon: InfoCircleIcon,
    bgClass: 'bg-blue-500',
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);
    const config = toastConfig[type];
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            const exitTimer = setTimeout(onClose, 500); // match animation duration
            return () => clearTimeout(exitTimer);
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 500);
    }
    
  return (
    <div className={`fixed bottom-20 right-5 w-full max-w-sm p-4 rounded-lg shadow-2xl text-white flex items-center space-x-4 ${config.bgClass} ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}>
      <Icon className="w-6 h-6 flex-shrink-0" />
      <p className="flex-grow">{message}</p>
      <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/20">
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Toast;