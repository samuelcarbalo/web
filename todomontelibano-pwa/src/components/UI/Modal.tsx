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
      {/* Overlay semi-transparente - fondo difuminado pero visible */}
      <div 
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Contenedor centrado */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0 pointer-events-none">
        {/* Contenido del modal - FONDO SÓLIDO para poder interactuar */}
        <div 
          className="relative transform overflow-hidden rounded-lg bg-white/95 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;