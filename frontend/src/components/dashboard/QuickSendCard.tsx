// FILE: src/components/dashboard/QuickSendCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Zap, ChevronRight, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Contact, EmailTemplate } from '../../types';

export interface QuickSendCardProps {
  uncontactedRecruiters: Contact[];
  defaultTemplate: EmailTemplate | null;
  remainingDailyLimit: number;
}

export const QuickSendCard: React.FC<QuickSendCardProps> = ({
  uncontactedRecruiters,
  defaultTemplate,
  remainingDailyLimit,
}) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>(
    uncontactedRecruiters[0]?.id || ''
  );

  if (uncontactedRecruiters.length === 0) return null;

  const handleGoToSend = () => {
    if (selectedId) {
      navigate(`/send?contactId=${selectedId}`);
    } else {
      navigate('/send');
    }
  };

  return (
    <Card className="p-5 bg-[#0c0c0c] border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">Quick Outreach</h4>
            <p className="text-[11px] text-zinc-500">Next available recruiter in queue</p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          {remainingDailyLimit} quota left
        </span>
      </div>

      <div className="space-y-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500/50"
        >
          {uncontactedRecruiters.slice(0, 15).map((r) => (
            <option key={r.id} value={r.id} className="bg-[#0c0c0c] text-white">
              {r.hr_name} — {r.company_name} ({r.job_role || 'No role'})
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-zinc-500 truncate max-w-[200px]">
            Template: <strong className="text-zinc-300 font-medium">{defaultTemplate?.name || 'Default Template'}</strong>
          </div>

          <Button
            size="sm"
            variant="primary"
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            onClick={handleGoToSend}
          >
            Review & Send
          </Button>
        </div>
      </div>
    </Card>
  );
};
