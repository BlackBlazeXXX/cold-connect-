// FILE: src/components/dashboard/FollowUpSection.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Send,
  MessageSquare,
  Calendar,
  AlertCircle,
  CheckCircle2,
  BellRing,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Contact } from '../../types';
import { formatDistanceToNow, format, isToday, isPast, isBefore, addDays } from 'date-fns';

export interface FollowUpSectionProps {
  contacts: Contact[];
  onMarkReplied: (contactId: string) => void;
  onSnooze: (contactId: string, days?: number) => void;
}

export const FollowUpSection: React.FC<FollowUpSectionProps> = ({
  contacts,
  onMarkReplied,
  onSnooze,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming'>('today');

  const now = new Date();
  const endOfWeek = addDays(now, 7);

  // Group contacts with scheduled follow-ups who haven't replied and aren't blocked
  const activeFollowUps = contacts.filter(
    (c) => c.follow_up_due_at && c.status !== 'Replied' && !c.do_not_email
  );

  const dueToday = activeFollowUps.filter((c) => isToday(new Date(c.follow_up_due_at!)));
  const overdue = activeFollowUps.filter(
    (c) => isPast(new Date(c.follow_up_due_at!)) && !isToday(new Date(c.follow_up_due_at!))
  );
  const upcoming = activeFollowUps.filter((c) => {
    const d = new Date(c.follow_up_due_at!);
    return isBefore(d, endOfWeek) && !isPast(d) && !isToday(d);
  });

  const displayedList =
    activeTab === 'today' ? dueToday : activeTab === 'overdue' ? overdue : upcoming;

  const tabs = [
    { id: 'today', label: 'Due Today', count: dueToday.length },
    { id: 'overdue', label: 'Overdue', count: overdue.length },
    { id: 'upcoming', label: 'Upcoming (7d)', count: upcoming.length },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight">Follow-Up Reminders</h4>
            <p className="text-xs text-zinc-500">
              Prompt nudges for recruiters who haven't yet responded to initial outreach.
            </p>
          </div>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as any)}
          variant="pills"
        />
      </div>

      {displayedList.length === 0 ? (
        <div className="text-center py-8 bg-white/[0.01] border border-white/5 rounded-xl">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-white">All caught up!</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {activeTab === 'today'
              ? 'No follow-up emails due today.'
              : activeTab === 'overdue'
              ? 'Zero overdue follow-ups.'
              : 'No follow-ups due in the next 7 days.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-[#0a0a0a]">
          {displayedList.map((contact) => {
            const lastSent = contact.last_sent_at
              ? formatDistanceToNow(new Date(contact.last_sent_at), { addSuffix: true })
              : 'Unknown';

            const isSecondFollowUp = contact.status === 'Follow-Up 1 Sent';

            return (
              <div
                key={contact.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{contact.hr_name}</span>
                    <span className="text-zinc-500">at</span>
                    <span className="font-medium text-zinc-300">{contact.company_name}</span>
                    {contact.job_role && (
                      <span className="text-[11px] text-zinc-500 hidden md:inline font-mono">
                        • {contact.job_role}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1">
                    <Badge variant={isSecondFollowUp ? 'warning' : 'neutral'} size="sm">
                      {isSecondFollowUp ? 'Follow-up #2' : 'Follow-up #1'}
                    </Badge>
                    <span className="font-mono">Last sent: {lastSent}</span>
                    <span>•</span>
                    <span className="font-mono text-zinc-500">{contact.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    onClick={() =>
                      navigate(
                        `/send?contactId=${contact.id}&templateType=${
                          isSecondFollowUp ? 'Follow-up 2' : 'Follow-up 1'
                        }`
                      )
                    }
                  >
                    Send Follow-Up
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                    onClick={() => onMarkReplied(contact.id)}
                  >
                    Mark Replied
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Clock className="w-3.5 h-3.5 text-zinc-500" />}
                    onClick={() => onSnooze(contact.id, 3)}
                    title="Snooze reminder by 3 days"
                  >
                    Snooze 3d
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
