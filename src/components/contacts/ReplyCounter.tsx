// FILE: src/components/contacts/ReplyCounter.tsx
import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

export interface ReplyCounterProps {
  count: number;
  onMarkReplied?: () => void;
  showButton?: boolean;
}

export const ReplyCounter: React.FC<ReplyCounterProps> = ({
  count = 0,
  onMarkReplied,
  showButton = true,
}) => {
  const maxDots = 4;
  const dots = [];

  for (let i = 0; i < maxDots; i++) {
    dots.push(i < count);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-xs" title={`${count} replies received`}>
        {dots.map((filled, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              filled ? 'bg-emerald-400' : 'bg-white/10'
            }`}
          />
        ))}
        <span className="text-[11px] font-mono text-zinc-500 ml-1">{count}</span>
      </div>

      {showButton && onMarkReplied && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMarkReplied();
          }}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
          title="Increment reply count"
        >
          <MessageSquarePlus className="w-3 h-3" />
          <span className="hidden sm:inline">+ Reply</span>
        </button>
      )}
    </div>
  );
};
