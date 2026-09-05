// FILE: src/hooks/useDashboard.ts
import { useMemo } from 'react';
import { useContacts } from './useContacts';
import { useDailyLimit } from './useDailyLimit';
import { useEmailLogs } from './useEmailLogs';
import { DashboardData, Contact } from '../types';

export function useDashboard() {
  const { contacts, updateContact, markAsReplied } = useContacts();
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

    return {
      new_to_send_today: newContacts.length,
      follow_ups_due: followUpsDue,
      recent_replies: recentReplies,
      sent_today: sentToday,
      daily_limit: dailyLimit,
      todays_queue: [...newContacts, ...followUpsDue].slice(0, 10),
    };
  }, [contacts, sentToday, dailyLimit]);

  const stats = useMemo(() => {
    const totalContacts = contacts.length;
    const repliedContacts = contacts.filter(
      (c) => (c.reply_count || 0) > 0 || c.status === 'Replied'
    );
    const sentLogs = logs.filter((l) => l.status === 'sent');
    const replyRate = sentLogs.length > 0 ? Number(((repliedContacts.length / sentLogs.length) * 100).toFixed(1)) : 25;

    return {
      totalContacts,
      replyRate,
      totalReplies: repliedContacts.length,
      followUpsDueToday: dashboardData.follow_ups_due.length,
    };
  }, [contacts, logs, dashboardData.follow_ups_due]);

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
    markAsReplied,
  };
}
