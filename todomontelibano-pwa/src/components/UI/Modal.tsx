import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-6 pointer-events-none">
        <div
          className="relative transform overflow-hidden rounded-3xl glass text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg pointer-events-auto hover:shadow-glow"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pb-6 pt-6 sm:p-8 sm:pb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-3xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
