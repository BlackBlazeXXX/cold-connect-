// FILE: src/components/settings/DailyLimitConfig.tsx
import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';

export interface DailyLimitConfigProps {
  dailyLimit: number;
  onChange: (newLimit: number) => void;
}

export const DailyLimitConfig: React.FC<DailyLimitConfigProps> = ({
  dailyLimit,
  onChange,
}) => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Daily Sending Quota</h4>
          <p className="text-xs text-zinc-500">
            Enforce a strict daily ceiling to safeguard your domain reputation from spam blacklists.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white">Maximum Daily Emails</span>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            <span className="text-lg font-mono font-bold text-emerald-400">{dailyLimit}</span>
            <span className="text-[11px] text-emerald-500 font-mono">/ day</span>
          </div>
        </div>

        <input
          type="range"
          min={1}
          max={50}
          value={dailyLimit ?? 25}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full accent-emerald-500 cursor-pointer"
        />

        <div className="flex justify-between text-[11px] font-mono text-zinc-500">
          <span>1 email</span>
          <span>25 recommended</span>
          <span>50 max</span>
        </div>

        <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-xs space-y-2">
          <div className="font-medium text-white flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Best Practices
          </div>
          <ul className="space-y-1 text-zinc-400 text-[11px]">
            <li>• <strong className="text-zinc-200">New domain or warmup address:</strong> 15–20 emails/day</li>
            <li>• <strong className="text-zinc-200">Established primary email:</strong> 25–35 emails/day</li>
            <li>• <strong className="text-zinc-200">Avoid:</strong> Exceeding 50 emails/day on standard personal inboxes</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
