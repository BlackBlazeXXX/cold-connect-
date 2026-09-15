import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Send,
  MessageSquare,
  UploadCloud,
  UserPlus,
  Clock,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ActivityCalendar } from '../components/ui/ActivityCalendar';
import { ActivityDetailModal } from '../components/ui/ActivityDetailModal';
import { useEmailLogs } from '../hooks/useEmailLogs';
import { useContacts } from '../hooks/useContacts';
import { EmailLog, Contact } from '../types';
import {
  format,
  isSameDay,
  startOfDay,
  endOfDay,
  subDays,
  isToday,
  isYesterday,
} from 'date-fns';

type LogFilter = 'all' | 'sent' | 'replied' | 'failed';

export const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { logs } = useEmailLogs();
  const { contacts } = useContacts();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [logFilter, setLogFilter] = useState<LogFilter>('all');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  const dayLogs = useMemo(() => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    return logs
      .filter((l) => {
        const sent = new Date(l.sent_at);
        return sent >= dayStart && sent <= dayEnd;
      })
      .filter((l) => {
        if (logFilter === 'all') return true;
        if (logFilter === 'sent') return l.status === 'sent';
        if (logFilter === 'failed') return l.status === 'failed';
        if (logFilter === 'replied') {
          const contact = contacts.find((c) => c.id === l.contact_id);
          return contact?.status === 'Replied';
        }
        return true;
      })
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  }, [logs, selectedDate, logFilter, contacts]);

  const hasActivityOnDate = (date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    return logs.some((l) => {
      const sent = new Date(l.sent_at);
      return sent >= dayStart && sent <= dayEnd;
    });
  };

  const getContactForLog = (log: EmailLog): Contact | null => {
    return contacts.find((c) => c.id === log.contact_id) ?? null;
  };

  const getDateLabel = () => {
    if (isToday(selectedDate)) return 'Today';
    if (isYesterday(selectedDate)) return 'Yesterday';
    return format(selectedDate, 'EEEE, MMM d');
  };

  const dayStats = useMemo(() => {
    const sent = dayLogs.filter((l) => l.status === 'sent').length;
    const failed = dayLogs.filter((l) => l.status === 'failed').length;
    return { sent, failed, total: dayLogs.length };
  }, [dayLogs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Activity</h1>
          <p className="text-xs text-zinc-500">Full history of all outreach events.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-4">
          <ActivityCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            hasActivity={hasActivityOnDate}
          />

          <Card className="p-4 bg-[#0c0c0c] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-white">{getDateLabel()}</h4>
              <div className="flex items-center gap-1">
                {(['all', 'sent', 'failed', 'replied'] as LogFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-colors ${
                      logFilter === f
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Send className="w-3 h-3 text-emerald-400" /> {dayStats.sent} sent
              </span>
              {dayStats.failed > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-rose-400" /> {dayStats.failed} failed
                </span>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-5 bg-[#0c0c0c] border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white">
                Events on {format(selectedDate, 'MMM d, yyyy')}
              </h4>
              <Badge variant="neutral" size="sm">{dayLogs.length} events</Badge>
            </div>

            {dayLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-zinc-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-600" />
                <p>No activity on this date.</p>
                <p className="text-[11px] text-zinc-600 mt-1">Pick another day from the calendar.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dayLogs.map((log) => {
                  const contact = getContactForLog(log);
                  const time = format(new Date(log.sent_at), 'h:mm a');

                  return (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-[#0a0a0a] border border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        log.status === 'sent'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}>
                        {log.status === 'sent' ? <Send className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-200 font-medium truncate">
                          {contact ? (
                            <>
                              {contact.hr_name} <span className="text-zinc-500">at</span> {contact.company_name}
                            </>
                          ) : (
                            log.recipient_email
                          )}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
                          "{log.subject_used}"
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-zinc-500 font-mono">{time}</span>
                        <div className="mt-1">
                          <Badge
                            variant={log.status === 'sent' ? 'success' : log.status === 'failed' ? 'danger' : 'warning'}
                            size="sm"
                          >
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {selectedLog && (
        <ActivityDetailModal
          log={selectedLog}
          contact={getContactForLog(selectedLog)}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};