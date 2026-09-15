// FILE: src/components/analytics/FunnelChart.tsx
import React from 'react';
import { Card } from '../ui/Card';
import { Users, Send, MailOpen, MessageSquare, Award } from 'lucide-react';

export interface FunnelStep {
  label: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

export interface FunnelChartProps {
  totalContacts: number;
  emailsSent: number;
  repliesReceived: number;
  positiveReplies: number;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  totalContacts,
  emailsSent,
  repliesReceived,
  positiveReplies,
}) => {
  const sentPercent = totalContacts > 0 ? Math.round((emailsSent / totalContacts) * 100) : 0;
  // Estimated open rate based on industry benchmark of 45-60% of sent
  const estimatedOpened = Math.round(emailsSent * 0.52);
  const openPercent = emailsSent > 0 ? Math.round((estimatedOpened / emailsSent) * 100) : 0;
  const replyPercent = emailsSent > 0 ? Math.round((repliesReceived / emailsSent) * 100) : 0;
  const positivePercent =
    repliesReceived > 0 ? Math.round((positiveReplies / repliesReceived) * 100) : 0;

  const steps: FunnelStep[] = [
    {
      label: 'Contacts Uploaded',
      count: totalContacts,
      percentage: 100,
      icon: <Users className="w-4 h-4" />,
      color: '#6366F1',
    },
    {
      label: 'Emails Sent',
      count: emailsSent,
      percentage: sentPercent,
      icon: <Send className="w-4 h-4" />,
      color: '#3B82F6',
    },
    {
      label: 'Estimated Opens',
      count: estimatedOpened,
      percentage: openPercent,
      icon: <MailOpen className="w-4 h-4" />,
      color: '#06B6D4',
    },
    {
      label: 'Replies Tracked',
      count: repliesReceived,
      percentage: replyPercent,
      icon: <MessageSquare className="w-4 h-4" />,
      color: '#22C55E',
    },
    {
      label: 'Positive / Interview',
      count: positiveReplies,
      percentage: positivePercent,
      icon: <Award className="w-4 h-4" />,
      color: '#8B5CF6',
    },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Outreach Conversion Funnel</h4>
          <p className="text-xs text-zinc-500">
            Conversion efficiency from recruiter contact import to interview response
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-zinc-200">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {step.icon}
                </span>
                <span>{step.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-white">{step.count}</span>
                <span className="text-[11px] font-mono text-zinc-500 w-10 text-right">
                  {step.percentage}%
                </span>
              </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(4, Math.min(100, step.percentage))}%`,
                  backgroundColor: step.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
