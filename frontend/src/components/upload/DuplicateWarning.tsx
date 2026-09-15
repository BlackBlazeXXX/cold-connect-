// FILE: src/components/upload/DuplicateWarning.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface DuplicateWarningProps {
  email: string;
  onAction: (action: 'skip' | 'update' | 'keep') => void;
  currentAction?: 'skip' | 'update' | 'keep';
}

export const DuplicateWarning: React.FC<DuplicateWarningProps> = ({
  email,
  onAction,
  currentAction = 'skip',
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs">
      <div className="flex items-center gap-1.5 text-amber-400">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>This email is already in your contacts list.</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onAction('skip')}
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
            currentAction === 'skip'
              ? 'bg-amber-500 text-black font-bold'
              : 'bg-[#0a0a0a] text-amber-400 border border-amber-500/30 hover:bg-amber-500/10'
          }`}
        >
          Skip This Row
        </button>
        <button
          type="button"
          onClick={() => onAction('update')}
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
            currentAction === 'update'
              ? 'bg-emerald-500 text-black font-bold'
              : 'bg-[#0a0a0a] text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
          }`}
        >
          Update Existing
        </button>
        <button
          type="button"
          onClick={() => onAction('keep')}
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
            currentAction === 'keep'
              ? 'bg-zinc-600 text-white font-medium'
              : 'bg-[#0a0a0a] text-zinc-400 border border-white/10 hover:bg-white/5'
          }`}
        >
          Add Anyway
        </button>
      </div>
    </div>
  );
};
