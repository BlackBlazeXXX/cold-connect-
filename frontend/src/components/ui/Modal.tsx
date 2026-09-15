// FILE: src/components/ui/Modal.tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthClass} bg-[#0c0c0c] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col text-white`}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-white/5">
            <div>
              {title && <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>}
              {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
