// FILE: src/components/contacts/DoNotEmailToggle.tsx
import React, { useState } from 'react';
import { Ban, Check } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Contact } from '../../types';

export interface DoNotEmailToggleProps {
  contact: Contact;
  onToggle: (blocked: boolean) => void;
  variant?: 'button' | 'icon';
}

export const DoNotEmailToggle: React.FC<DoNotEmailToggleProps> = ({
  contact,
  onToggle,
  variant = 'button',
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!contact.do_not_email) {
      setShowConfirm(true);
    } else {
      // Unblock directly
      onToggle(false);
    }
  };

  const handleConfirmBlock = () => {
    setShowConfirm(false);
    onToggle(true);
  };

  return (
    <>
      {variant === 'button' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            contact.do_not_email
              ? 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>{contact.do_not_email ? 'Unblock' : 'Do Not Email'}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            contact.do_not_email
              ? 'text-zinc-400 hover:text-white hover:bg-white/5'
              : 'text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10'
          }`}
          title={contact.do_not_email ? 'Unblock contact' : 'Do Not Email (Block)'}
        >
          <Ban className="w-3.5 h-3.5" />
        </button>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmBlock}
        variant="danger"
        title={`Block ${contact.hr_name}?`}
        message={
          <span>
            Block <strong>{contact.hr_name}</strong> at <strong>{contact.company_name}</strong>?
            They will be marked as "Do Not Email" and won't appear in send lists anymore.
          </span>
        }
        confirmLabel="Yes, Block"
      />
    </>
  );
};
