// FILE: src/components/dashboard/DailyLimitBar.tsx
import React from 'react';
import { Zap, Clock, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';

export interface DailyLimitBarProps {
  sentToday: number;
  dailyLimit: number;
  percentUsed: number;
  remainingToday: number;
}

export const DailyLimitBar: React.FC<DailyLimitBarProps> = ({
  sentToday,
  dailyLimit,
  percentUsed,
  remainingToday,
}) => {
  const isCapped = remainingToday <= 0;
  const isWarning = percentUsed >= 80 && !isCapped;

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <h4 className="text-sm font-semibold text-white tracking-tight">Daily Sending Quota</h4>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isCapped
              ? 'Daily quota reached! Resets tomorrow at midnight to maintain deliverability.'
              : `${remainingToday} outreach emails remaining today.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-mono font-medium text-white">
            {sentToday} <span className="text-sm text-zinc-500 font-normal">/ {dailyLimit}</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isCapped
              ? 'bg-rose-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(100, percentUsed)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 font-mono">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Spam protection active
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Resets midnight UTC
        </span>
      </div>
    </Card>
  );
};
