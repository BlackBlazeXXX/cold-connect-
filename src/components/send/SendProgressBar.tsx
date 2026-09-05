// FILE: src/components/send/SendProgressBar.tsx
import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export interface SendProgressBarProps {
  current: number;
  total: number;
  currentRecipientName?: string;
  currentCompanyName?: string;
  successCount: number;
  failedCount: number;
  failures?: { name: string; email: string; reason: string }[];
  isComplete: boolean;
  onCancel?: () => void;
  onDone?: () => void;
}

export const SendProgressBar: React.FC<SendProgressBarProps> = ({
  current,
  total,
  currentRecipientName,
  currentCompanyName,
  successCount,
  failedCount,
  failures = [],
  isComplete,
  onCancel,
  onDone,
}) => {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">
            {isComplete
              ? 'Outreach Campaign Complete'
              : `Sending outreach (${current} of ${total})...`}
          </h4>
          {!isComplete && currentRecipientName && (
            <p className="text-xs text-zinc-400 mt-0.5">
              Current recruiter: <strong className="text-white">{currentRecipientName}</strong> at{' '}
              <strong className="text-white">{currentCompanyName}</strong>
            </p>
          )}
        </div>

        <span className="text-sm font-mono font-semibold text-emerald-400">{percent}%</span>
      </div>

      {/* Animated Progress Bar */}
      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isComplete ? 'bg-emerald-400' : 'bg-emerald-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Live counts */}
      <div className="flex items-center justify-around p-3 bg-[#0a0a0a] rounded-xl border border-white/5 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-medium">{successCount} Sent</span>
        </div>

        <div className="flex items-center gap-1.5 text-rose-400">
          <XCircle className="w-4 h-4" />
          <span className="font-medium">{failedCount} Failed</span>
        </div>
      </div>

      {/* Failure list if any */}
      {failures.length > 0 && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 text-xs">
          <div className="font-semibold text-rose-400">Delivery errors encountered:</div>
          {failures.map((f, idx) => (
            <div key={idx} className="text-rose-300 text-[11px] font-mono">
              {f.name} ({f.email}): {f.reason}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
        {!isComplete && onCancel && (
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel Remaining Sends
          </Button>
        )}
        {isComplete && onDone && (
          <Button variant="primary" size="sm" onClick={onDone}>
            Done / Return to Contacts
          </Button>
        )}
      </div>
    </div>
  );
};
