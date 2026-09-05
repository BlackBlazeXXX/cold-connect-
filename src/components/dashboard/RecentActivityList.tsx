// FILE: src/components/dashboard/RecentActivityList.tsx
import React from 'react';
import { Send, MessageSquare, UploadCloud, UserPlus, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { EmailLog } from '../../types';
import { formatDistanceToNow } from 'date-fns';

export interface RecentActivityListProps {
  logs: EmailLog[];
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ logs }) => {
  return (
    <Card className="p-5 bg-[#0c0c0c] border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white tracking-tight">Recent Activity</h4>
        <span className="text-[11px] text-zinc-500 font-mono">Last 10 events</span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-xs text-zinc-500">
          <Clock className="w-6 h-6 mx-auto mb-1.5 opacity-50 text-zinc-600" />
          No outreach activity logged yet. Import contacts or send your first email.
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.slice(0, 10).map((log) => {
            const timeAgo = formatDistanceToNow(new Date(log.sent_at), { addSuffix: true });

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0a0a0a] border border-white/5 text-xs hover:bg-white/[0.02] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 font-medium truncate">
                    Outreach email sent to{' '}
                    <strong className="text-white">{log.recipient_email}</strong>
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
                    Subject: "{log.subject_used}"
                  </p>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0 font-mono">{timeAgo}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
