// FILE: src/components/settings/FollowUpIntervalConfig.tsx
import React from 'react';
import { Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

export interface FollowUpIntervalConfigProps {
  interval1: number;
  interval2: number;
  onChange: (fields: {
    default_follow_up_days?: number;
    default_follow_up_2_days?: number;
  }) => void;
}

export const FollowUpIntervalConfig: React.FC<FollowUpIntervalConfigProps> = ({
  interval1,
  interval2,
  onChange,
}) => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Automated Follow-Up Intervals</h4>
          <p className="text-xs text-zinc-500">
            Configure default cadence for when recruiter follow-ups become due.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Follow-Up #1 Due (Days after Initial)"
          type="number"
          min={1}
          max={30}
          value={interval1 ?? 3}
          onChange={(e) =>
            onChange({ default_follow_up_days: parseInt(e.target.value, 10) || 3 })
          }
          helperText="Recommended: 3–5 business days"
        />

        <Input
          label="Follow-Up #2 Due (Days after Follow-Up #1)"
          type="number"
          min={1}
          max={30}
          value={interval2 ?? 7}
          onChange={(e) =>
            onChange({ default_follow_up_2_days: parseInt(e.target.value, 10) || 7 })
          }
          helperText="Recommended: 7–10 days"
        />
      </div>

      <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-xs text-zinc-400">
        <strong className="text-white">Cadence Strategy:</strong> Recruiters receive hundreds of inbound messages. A gentle
        3-day nudge recovers ~42% of missed replies without feeling pushy.
      </div>
    </Card>
  );
};
