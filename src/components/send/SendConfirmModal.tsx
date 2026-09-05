// FILE: src/components/send/SendConfirmModal.tsx
import React from 'react';
import { Mail, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface SendConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipientCount: number;
  senderName: string;
  senderEmail: string;
  sentToday: number;
  dailyLimit: number;
  isSending?: boolean;
}

export const SendConfirmModal: React.FC<SendConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  recipientCount,
  senderName,
  senderEmail,
  sentToday,
  dailyLimit,
  isSending = false,
}) => {
  const newTotalSent = sentToday + recipientCount;
  const remainingAfter = Math.max(0, dailyLimit - newTotalSent);
  const isCloseToLimit = newTotalSent >= dailyLimit * 0.8;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Email Outreach"
      description="Review sender details and delivery parameters before starting dispatch."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs">
        {/* Summary Card */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 font-mono">Recipients to send:</span>
            <span className="font-bold text-white text-sm font-mono">{recipientCount} emails</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500 font-mono">Sender Account:</span>
            <span className="font-medium text-zinc-200">
              {senderName} &lt;{senderEmail}&gt;
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-zinc-500 font-mono">Daily Quota After Send:</span>
            <span className="font-semibold text-white font-mono">
              {newTotalSent} / {dailyLimit} ({remainingAfter} remaining)
            </span>
          </div>
        </div>

        {/* Warning if close to limit */}
        {isCloseToLimit && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              You will have used {newTotalSent} of {dailyLimit} daily emails after this send.
            </span>
          </div>
        )}

        {/* Anti-spam reputation protection notice */}
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-zinc-300 rounded-xl flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <span className="font-medium text-emerald-400">Deliverability & Reputation Guard:</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Emails are automatically staggered by 2–4 seconds to prevent bounce bursts and keep
              your address out of recruiter spam filters.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
          <Button variant="secondary" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isSending}
            leftIcon={<Mail className="w-4 h-4" />}
          >
            Confirm & Send ({recipientCount} {recipientCount === 1 ? 'Email' : 'Emails'})
          </Button>
        </div>
      </div>
    </Modal>
  );
};
