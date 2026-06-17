// src/components/common/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };
  
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>
        
        <div
          className={`
            inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden
            text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl
            ${className}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="flex justify-between items-center mb-4">
            {title && (
              <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;