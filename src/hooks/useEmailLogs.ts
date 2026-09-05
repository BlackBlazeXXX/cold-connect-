// FILE: src/hooks/useEmailLogs.ts
import { useState, useEffect, useCallback } from 'react';
import { EmailLog } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { STORAGE_KEYS } from '../constants/constants';

const SEED_LOGS: Omit<EmailLog, 'user_id'>[] = [
  {
    id: 'log_1',
    contact_id: 'c_seed_1',
    template_id: 'tmpl_1',
    subject_used: 'Application for Senior Frontend Engineer — Sanju Designer',
    body_used: 'Hi Sarah,\n\nI hope you are having a great week...',
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_seed_101',
    status: 'sent',
  },
  {
    id: 'log_2',
    contact_id: 'c_seed_2',
    template_id: 'tmpl_1',
    subject_used: 'Application for Full Stack Engineer — Sanju Designer',
    body_used: 'Hi Michael,\n\nI have been closely following Figma...',
    sent_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_seed_102',
    status: 'sent',
  },
  {
    id: 'log_3',
    contact_id: 'c_seed_3',
    template_id: 'tmpl_1',
    subject_used: 'Application for Design Engineer — Sanju Designer',
    body_used: 'Hi Elena,\n\nExcited about Vercel frontend design roles...',
    sent_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_seed_103',
    status: 'sent',
  },
  {
    id: 'log_4',
    contact_id: 'c_seed_3',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Design Engineer at Vercel',
    body_used: 'Hi Elena,\n\nI wanted to quickly follow up on my note...',
    sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_seed_104',
    status: 'sent',
  },
  {
    id: 'log_5',
    contact_id: 'c_seed_7',
    template_id: 'tmpl_1',
    subject_used: 'Application for UI Platform Engineer — Sanju Designer',
    body_used: 'Hi Jessica,\n\nFollowing Airbnb product platform work...',
    sent_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_seed_105',
    status: 'sent',
  },
];

export function useEmailLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || 'demo_user';

  const loadLogs = useCallback(async () => {
    setLoading(true);
    if (isSupabaseConfigured && user) {
      try {
        const { data, error } = await supabase
          .from('email_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('sent_at', { ascending: false });

        if (error) throw error;
        setLogs((data as EmailLog[]) || []);
      } catch (err) {
        console.error('Error loading Supabase email logs:', err);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const storageKey = `${STORAGE_KEYS.emailLogsFallback}_${userId}`;
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          setLogs(JSON.parse(raw));
        } else {
          const initial = SEED_LOGS.map((l) => ({ ...l, user_id: userId }));
          localStorage.setItem(storageKey, JSON.stringify(initial));
          setLogs(initial);
        }
      } catch (e) {
        console.error('Error reading email logs from storage:', e);
      } finally {
        setLoading(false);
      }
    }
  }, [user, userId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const logEmailSent = async (
    entry: Omit<EmailLog, 'id' | 'user_id' | 'sent_at'>
  ): Promise<EmailLog> => {
    const newLog: EmailLog = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      sent_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && user) {
      const { data, error } = await supabase
        .from('email_logs')
        .insert(newLog)
        .select()
        .single();
      if (error) {
        console.error('Failed to insert email log in Supabase:', error);
      }
      setLogs((prev) => [data as EmailLog || newLog, ...prev]);
      return (data as EmailLog) || newLog;
    } else {
      const storageKey = `${STORAGE_KEYS.emailLogsFallback}_${userId}`;
      const updated = [newLog, ...logs];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setLogs(updated);
      return newLog;
    }
  };

  const getLogsForContact = useCallback(
    (contactId: string): EmailLog[] => {
      return logs.filter((l) => l.contact_id === contactId);
    },
    [logs]
  );

  return {
    logs,
    loading,
    logEmailSent,
    logEmail: logEmailSent,
    getLogsForContact,
    refreshLogs: loadLogs,
  };
}
