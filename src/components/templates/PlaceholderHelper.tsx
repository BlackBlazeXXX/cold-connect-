// FILE: src/components/templates/PlaceholderHelper.tsx
import React from 'react';
import { EMAIL_PLACEHOLDERS } from '../../constants/constants';
import { Plus } from 'lucide-react';

export interface PlaceholderHelperProps {
  onInsert: (placeholderKey: string) => void;
}

export const PlaceholderHelper: React.FC<PlaceholderHelperProps> = ({ onInsert }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      <span className="text-[11px] font-mono text-zinc-500 mr-1 uppercase tracking-wider">
        Merge Tags:
      </span>
      {EMAIL_PLACEHOLDERS.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onInsert(item.key)}
          title={item.description}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono bg-white/5 text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer select-none"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>{item.key}</span>
        </button>
      ))}
    </div>
  );
};
