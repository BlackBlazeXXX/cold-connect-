import { useMemo } from 'react';
import { subDays, subWeeks, subMonths, isAfter, startOfDay, format } from 'date-fns';
import { useContacts } from './useContacts';
import { useDailyLimit } from './useDailyLimit';
import { useEmailLogs } from './useEmailLogs';
import { DashboardData, Contact } from '../types';

export function useDashboard(timeframe: '1d' | '1w' | '1m' | 'all' = '1w') {
  const { contacts, updateContact } = useContacts();
  const { sentToday, dailyLimit, remaining, percentUsed } = useDailyLimit();
  const { logs } = useEmailLogs();

  const dashboardData = useMemo<DashboardData>(() => {
    const now = new Date();

    const newContacts = contacts.filter(
      (c) => c.status === 'New' && !c.do_not_email
    );

    const followUpsDue = contacts.filter((c) => {
      if (c.do_not_email || c.status === 'Replied' || c.status === 'Do Not Email') {
        return false;
      }
      if (!c.follow_up_due_at) return false;
      return new Date(c.follow_up_due_at) <= now;
    });

    const recentReplies = contacts
      .filter((c) => (c.reply_count || 0) > 0 || c.status === 'Replied')
      .sort((a, b) => {
        const dateA = a.last_replied_at ? new Date(a.last_replied_at).getTime() : 0;
        const dateB = b.last_replied_at ? new Date(b.last_replied_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    const last7DaysSends = Array.from({ length: 7 }, (_, i) => {
      const day = subDays(now, 6 - i);
      const dayStart = startOfDay(day);
      const dayEnd = startOfDay(subDays(day, -1));
      return logs.filter(
        (l) => l.status === 'sent' && new Date(l.sent_at) >= dayStart && new Date(l.sent_at) < dayEnd
      ).length;
    });

    return {
      new_to_send_today: newContacts.length,
      follow_ups_due: followUpsDue,
      recent_replies: recentReplies,
      sent_today: sentToday,
      daily_limit: dailyLimit,
      todays_queue: [...newContacts, ...followUpsDue].slice(0, 10),
      last7DaysSends,
    };
  }, [contacts, sentToday, dailyLimit, logs]);

  const stats = useMemo(() => {
    const totalContacts = contacts.length;
    const totalUncontacted = contacts.filter((c) => c.status === 'New').length;
    const newToContactToday = contacts.filter((c) => c.status === 'New' && !c.do_not_email).length;
    
    const now = new Date();
    let startDate: Date | null = null;
    
    if (timeframe === '1d') startDate = subDays(now, 1);
    else if (timeframe === '1w') startDate = subWeeks(now, 1);
    else if (timeframe === '1m') startDate = subMonths(now, 1);

    const isWithinTimeframe = (dateStr?: string | null) => {
      if (!startDate || !dateStr) return true;
      return isAfter(new Date(dateStr), startDate);
    };

    const repliedContacts = contacts.filter((c) => {
      const hasReplied = (c.reply_count || 0) > 0 || c.status === 'Replied';
      return hasReplied && (timeframe === 'all' ? true : isWithinTimeframe(c.last_replied_at || c.created_at));
    });

    const sentLogs = logs.filter((l) => l.status === 'sent' && (timeframe === 'all' ? true : isWithinTimeframe(l.sent_at)));
    
    const replyRate = sentLogs.length > 0 ? Number(((repliedContacts.length / sentLogs.length) * 100).toFixed(1)) : (timeframe === 'all' ? 25 : 0);

    return {
      totalContacts,
      totalUncontacted,
      newToContactToday,
      replyRate,
      totalReplies: repliedContacts.length,
      followUpsDueToday: dashboardData.follow_ups_due.length,
    };
  }, [contacts, logs, dashboardData.follow_ups_due, timeframe]);

  const extendFollowUp = async (contactId: string, days: number = 2) => {
    const target = contacts.find((c) => c.id === contactId);
    if (!target) return;

    const baseDate = target.follow_up_due_at ? new Date(target.follow_up_due_at) : new Date();
    const newDueDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    await updateContact(contactId, {
      follow_up_due_at: newDueDate,
    });
  };

  const data = useMemo(() => {
    return {
      ...dashboardData,
      stats,
      recentLogs: logs.slice(0, 8),
    };
  }, [dashboardData, stats, logs]);

  return {
    data,
    loading: false,
    ...dashboardData,
    remainingToday: remaining,
    percentUsed,
    extendFollowUp,
  };
}
