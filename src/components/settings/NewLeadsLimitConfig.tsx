// FILE: src/components/settings/NewLeadsLimitConfig.tsx
import React from 'react';
import { List, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';

export interface NewLeadsLimitConfigProps {
  dailyLimit: number;
  onChange: (newLimit: number) => void;
}

export const NewLeadsLimitConfig: React.FC<NewLeadsLimitConfigProps> = ({
  dailyLimit,
  onChange,
}) => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
          <List className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Daily New Leads Quota</h4>
          <p className="text-xs text-zinc-500">
            Control how many fresh contacts appear in your "New Leads" tab each day.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white">Maximum Daily Leads</span>
          <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
            <span className="text-lg font-mono font-bold text-blue-400">{dailyLimit}</span>
            <span className="text-[11px] text-blue-500 font-mono">/ day</span>
          </div>
        </div>

        <input
          type="range"
          min={1}
          max={25}
          value={dailyLimit ?? 7}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full accent-blue-500 cursor-pointer"
        />

        <div className="flex justify-between text-[11px] font-mono text-zinc-500">
          <span>1 lead</span>
          <span>7 recommended</span>
          <span>25 max</span>
        </div>

        <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-xs space-y-2">
          <div className="font-medium text-white flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> How It Works
          </div>
          <ul className="space-y-1 text-zinc-400 text-[11px]">
            <li>• <strong className="text-zinc-200">Fresh batch daily:</strong> New contacts rotate in every day</li>
            <li>• <strong className="text-zinc-200">Priority queue:</strong> Never-shown contacts appear first</li>
            <li>• <strong className="text-zinc-200">Auto-rotation:</strong> Shown contacts rotate out until all are seen</li>
            <li>• <strong className="text-zinc-200">Focus quality:</strong> Smaller batches = better personalized outreach</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
