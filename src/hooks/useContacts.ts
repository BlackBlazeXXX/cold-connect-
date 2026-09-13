// FILE: src/hooks/useContacts.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Contact, ContactStatus, EmailLog } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { STORAGE_KEYS } from '../constants/constants';
import { APP_CONFIG } from '../constants/constants';
import { differenceInDays, startOfDay } from 'date-fns';

const SEED_CONTACTS: Omit<Contact, 'user_id'>[] = [
  {
    id: 'c_seed_1',
    hr_name: 'Sarah Jenkins',
    company_name: 'Stripe',
    email: 'sarah.j@stripe.com',
    job_role: 'Senior Frontend Engineer',
    status: 'Email Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    follow_up_due_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_shown_at: null,
    notes: 'Referred by LinkedIn posting for Product Engineering team.',
    do_not_email: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_seed_0',
  },
  {
    id: 'c_seed_2',
    hr_name: 'Michael Chen',
    company_name: 'Figma',
    email: 'mchen@figma.com',
    job_role: 'Full Stack Engineer',
    status: 'Replied',
    reply_count: 1,
    last_sent_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Replied asking for portfolio GitHub links and availability.',
    do_not_email: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_seed_0',
  },
  {
    id: 'c_seed_3',
    hr_name: 'Elena Rostova',
    company_name: 'Vercel',
    email: 'elena.r@vercel.com',
    job_role: 'Design Engineer',
    status: 'Follow-Up 1 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    follow_up_due_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Due/Overdue
    last_shown_at: null,
    notes: 'Follow-up sent highlighting Next.js performance optimizations.',
    do_not_email: false,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'manual',
    upload_batch_id: null,
  },
  {
    id: 'c_seed_4',
    hr_name: 'David Miller',
    company_name: 'Linear',
    email: 'david@linear.app',
    job_role: 'Product Engineer',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Recruiter for desktop and web experiences.',
    do_not_email: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_seed_1',
  },
  {
    id: 'c_seed_5',
    hr_name: 'Amara Okafor',
    company_name: 'Notion',
    email: 'aokafor@makenotion.com',
    job_role: 'Software Engineer, Core App',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Found on Tech Career fair directory.',
    do_not_email: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_seed_1',
  },
  {
    id: 'c_seed_6',
    hr_name: 'Alex Rivera',
    company_name: 'Datadog',
    email: 'alex.rivera@datadoghq.com',
    job_role: 'Frontend UI Engineer',
    status: 'Do Not Email',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Role filled internally; requested to withhold outreach.',
    do_not_email: true,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'manual',
    upload_batch_id: null,
  },
  {
    id: 'c_seed_7',
    hr_name: 'Jessica Taylor',
    company_name: 'Airbnb',
    email: 'jessica.t@airbnb.com',
    job_role: 'UI Platform Engineer',
    status: 'Replied',
    reply_count: 2,
    last_sent_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Phone screen scheduled for upcoming Tuesday.',
    do_not_email: false,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_seed_0',
  }
];

// Follow-up stage calculation helpers
export type FollowUpStage = 'new' | 'email_sent' | 'followup_1' | 'followup_2' | 'never_replied' | 'replied' | 'do_not_email';

export function getInitialEmailLog(emailLogs: EmailLog[], contactId: string): EmailLog | undefined {
  return emailLogs.find((l) => l.contact_id === contactId && l.email_type === 'initial');
}

export function getFollowUpLog(emailLogs: EmailLog[], contactId: string, type: EmailLog['email_type']): EmailLog | undefined {
  return emailLogs.find((l) => l.contact_id === contactId && l.email_type === type);
}

export function getDaysSinceInitial(emailLogs: EmailLog[], contactId: string, now: Date): number | null {
  const initialLog = getInitialEmailLog(emailLogs, contactId);
  if (!initialLog) return null;
  return differenceInDays(now, new Date(initialLog.sent_at));
}

export function getFollowUpStage(contact: Contact, emailLogs: EmailLog[], now: Date): FollowUpStage {
  if (contact.do_not_email) return 'do_not_email';
  if (contact.status === 'Replied' || (contact.reply_count > 0 && contact.last_replied_at)) return 'replied';

  const hasInitialEmail = emailLogs.some((l) => l.contact_id === contact.id && l.email_type === 'initial');
  if (!hasInitialEmail && !contact.last_sent_at) return 'new';

  const hasFollowUp1 = emailLogs.some((l) => l.contact_id === contact.id && l.email_type === 'follow_up_1');
  const hasFollowUp2 = emailLogs.some((l) => l.contact_id === contact.id && l.email_type === 'follow_up_2');

  const daysSinceInitial = getDaysSinceInitial(emailLogs, contact.id, now);

  // After 12 days with no reply → Never Replied
  if (daysSinceInitial !== null && daysSinceInitial >= 12) return 'never_replied';

  // Has follow-up 2 sent → Never Replied (lifecycle complete)
  if (hasFollowUp2) return 'never_replied';

  // Has follow-up 1, check for follow-up 2 eligibility (7+ days)
  if (hasFollowUp1 && daysSinceInitial !== null && daysSinceInitial >= 7) return 'followup_2';
  if (hasFollowUp1 && daysSinceInitial !== null && daysSinceInitial < 7) return 'followup_1';

  // Has initial email, no follow-up 1 yet, check for follow-up 1 eligibility (3+ days)
  if (hasInitialEmail && !hasFollowUp1 && daysSinceInitial !== null && daysSinceInitial >= 3) return 'followup_1';

  // Has initial email, less than 3 days → Email Sent (waiting for follow-up eligibility)
  if (hasInitialEmail && !hasFollowUp1 && daysSinceInitial !== null && daysSinceInitial < 3) return 'email_sent';

  // Has initial email but can't determine stage → Email Sent
  if (hasInitialEmail && !hasFollowUp1) return 'email_sent';

  return 'new';
}

export function filterContactsByStage(
  contacts: Contact[],
  emailLogs: EmailLog[],
  stage: FollowUpStage,
  now: Date = new Date()
): Contact[] {
  return contacts.filter((c) => {
    const contactStage = getFollowUpStage(c, emailLogs, now);
    return contactStage === stage;
  });
}

// Daily New Leads helpers
export function getDailyNewLeads(
  contacts: Contact[],
  emailLogs: EmailLog[],
  dailyLimit: number,
  now: Date = new Date()
): { batch: Contact[]; totalRemaining: number } {
  // Step 1: Find ALL contacts that were NEVER emailed and not do_not_email
  const allNewLeads = contacts.filter((c) => {
    if (c.do_not_email) return false;
    const stage = getFollowUpStage(c, emailLogs, now);
    return stage === 'new';
  });

  // Step 2: Split into two groups:
  //   Group A: Never shown before (last_shown_at === null) — PRIORITY
  //   Group B: Shown before but on a PREVIOUS day — SECONDARY
  const todayStr = startOfDay(now).toISOString();

  const neverShown = allNewLeads.filter((c) => !c.last_shown_at);
  const shownBeforeToday = allNewLeads.filter((c) => {
    if (!c.last_shown_at) return false;
    const shownDate = startOfDay(new Date(c.last_shown_at)).toISOString();
    return shownDate < todayStr;
  });

  // Step 3: Combine (new first, then older shown), take first N
  const batch = [...neverShown, ...shownBeforeToday].slice(0, dailyLimit);
  const totalRemaining = allNewLeads.length;

  return { batch, totalRemaining };
}

export async function markLeadsAsShown(
  contactIds: string[],
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>
): Promise<void> {
  const now = new Date().toISOString();
  // Update each contact's last_shown_at to now
  for (const id of contactIds) {
    await updateContact(id, { last_shown_at: now });
  }
}

export function getRemainingLeadsCount(
  contacts: Contact[],
  emailLogs: EmailLog[],
  now: Date = new Date()
): number {
  return contacts.filter((c) => {
    if (c.do_not_email) return false;
    const stage = getFollowUpStage(c, emailLogs, now);
    return stage === 'new';
  }).length;
}

export function useContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id || 'demo_user';

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (isSupabaseConfigured && user) {
      try {
        const { data, error: sbError } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (sbError) throw sbError;
        setContacts((data as Contact[]) || []);
      } catch (err: any) {
        console.error('Error fetching Supabase contacts:', err);
        setError(err.message || 'Failed to load contacts');
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage fallback
      try {
        const storageKey = `${STORAGE_KEYS.contactsFallback}_${userId}`;
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          setContacts(JSON.parse(raw));
        } else {
          // Initialize with seed data
          const initial = SEED_CONTACTS.map((c) => ({
            ...c,
            user_id: userId,
          }));
          localStorage.setItem(storageKey, JSON.stringify(initial));
          setContacts(initial);
        }
      } catch (e: any) {
        console.error('Error reading localStorage contacts:', e);
        setError('Failed to load cached contacts');
      } finally {
        setLoading(false);
      }
    }
  }, [user?.id, userId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const saveToLocal = (newContacts: Contact[]) => {
    const storageKey = `${STORAGE_KEYS.contactsFallback}_${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(newContacts));
    setContacts(newContacts);
  };

  const addContact = async (
    contactData: Omit<Contact, 'id' | 'user_id' | 'created_at'>
  ): Promise<Contact> => {
    const cleanEmail = contactData.email.trim().toLowerCase();

    // Check duplicate
    const exists = contacts.some((c) => c.email.toLowerCase() === cleanEmail);
    if (exists) {
      throw new Error(`Contact with email ${cleanEmail} already exists.`);
    }

    const newContact: Contact = {
      ...contactData,
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      email: cleanEmail,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && user) {
      const { data, error: sbError } = await supabase
        .from('contacts')
        .insert({
          ...newContact,
          user_id: user.id,
        })
        .select()
        .single();

      if (sbError) throw sbError;
      setContacts((prev) => [data as Contact, ...prev]);
      return data as Contact;
    } else {
      const updated = [newContact, ...contacts];
      saveToLocal(updated);
      return newContact;
    }
  };

  const addBatchContacts = async (
    batchContacts: Array<Omit<Contact, 'id' | 'user_id' | 'created_at'>>,
    batchInfo?: { fileName: string; fileType: 'csv' | 'pdf' }
  ) => {
    const batchId = `batch_${Date.now()}`;
    const existingEmailMap = new Map(contacts.map((c) => [c.email.toLowerCase(), c]));

    const toInsert: Contact[] = [];
    let duplicates = 0;
    let skipped = 0;

    for (const item of batchContacts) {
      const cleanEmail = item.email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        skipped++;
        continue;
      }
      if (existingEmailMap.has(cleanEmail)) {
        duplicates++;
        continue;
      }

      toInsert.push({
        ...item,
        id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user_id: userId,
        email: cleanEmail,
        created_at: new Date().toISOString(),
        upload_batch_id: batchId,
      });
      existingEmailMap.set(cleanEmail, toInsert[toInsert.length - 1]);
    }

    if (isSupabaseConfigured && user) {
      if (toInsert.length > 0) {
        const { error: insertErr } = await supabase.from('contacts').insert(toInsert);
        if (insertErr) throw insertErr;
      }

      if (batchInfo) {
        await supabase.from('upload_batches').insert({
          id: batchId,
          user_id: user.id,
          file_name: batchInfo.fileName,
          file_type: batchInfo.fileType,
          total_rows: batchContacts.length,
          imported: toInsert.length,
          skipped,
          duplicates,
          created_at: new Date().toISOString(),
        });
      }

      await loadContacts();
    } else {
      const updated = [...toInsert, ...contacts];
      saveToLocal(updated);
    }

    return {
      imported: toInsert.length,
      duplicates,
      skipped,
      batchId,
    };
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    if (isSupabaseConfigured && user) {
      const { error: sbErr } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (sbErr) throw sbErr;
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    } else {
      const updated = contacts.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveToLocal(updated);
    }
  };

  const deleteContact = async (id: string) => {
    if (isSupabaseConfigured && user) {
      const { error: sbErr } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (sbErr) throw sbErr;
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } else {
      const updated = contacts.filter((c) => c.id !== id);
      saveToLocal(updated);
    }
  };

  const markAsReplied = async (id: string) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;

    const newReplyCount = (contact.reply_count || 0) + 1;
    const updates: Partial<Contact> = {
      reply_count: newReplyCount,
      last_replied_at: new Date().toISOString(),
      status: 'Replied' as ContactStatus,
      follow_up_due_at: null, // Clear pending follow-up once replied
    };

    await updateContact(id, updates);
  };

  const toggleDoNotEmail = async (id: string, blocked: boolean) => {
    const updates: Partial<Contact> = {
      do_not_email: blocked,
      status: (blocked ? 'Do Not Email' : 'New') as ContactStatus,
    };
    await updateContact(id, updates);
  };

  const updateContactStatus = async (id: string, status: ContactStatus) => {
    await updateContact(id, { status });
  };

  const updateNotes = async (id: string, notes: string) => {
    await updateContact(id, { notes });
  };

  const scheduleFollowUp = async (id: string, daysFromNow: number) => {
    const dueAt = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString();
    await updateContact(id, { follow_up_due_at: dueAt });
  };

  const snoozeFollowUp = async (id: string, days: number = 3) => {
    const dueAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    await updateContact(id, { follow_up_due_at: dueAt });
  };

  const bulkDelete = async (ids: string[]) => {
    const idSet = new Set(ids);
    if (isSupabaseConfigured && user) {
      const { error: sbErr } = await supabase
        .from('contacts')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id);
      if (sbErr) throw sbErr;
      setContacts((prev) => prev.filter((c) => !idSet.has(c.id)));
    } else {
      const updated = contacts.filter((c) => !idSet.has(c.id));
      saveToLocal(updated);
    }
  };

  const resetContacts = async () => {
    if (isSupabaseConfigured && user) {
      await supabase.from('contacts').delete().eq('user_id', user.id);
      setContacts([]);
    } else {
      localStorage.removeItem(`${STORAGE_KEYS.contactsFallback}_${userId}`);
      setContacts([]);
    }
  };

  const loadSampleData = async () => {
    const sampleWithUser = SEED_CONTACTS.map((c) => ({
      ...c,
      user_id: userId,
    })) as Contact[];
    if (isSupabaseConfigured && user) {
      await supabase.from('contacts').upsert(sampleWithUser);
      await loadContacts();
    } else {
      saveToLocal(sampleWithUser);
    }
  };

  const importContacts = async (
    contactsList: Omit<Contact, 'id' | 'user_id' | 'created_at'>[]
  ) => {
    const res = await addBatchContacts(contactsList as any);
    return contactsList;
  };

  return {
    contacts,
    loading,
    error,
    addContact,
    addBatchContacts,
    importContacts,
    updateContact,
    updateContactStatus,
    updateNotes,
    scheduleFollowUp,
    snoozeFollowUp,
    deleteContact,
    bulkDelete,
    markAsReplied,
    markReplied: markAsReplied,
    toggleDoNotEmail,
    resetContacts,
    loadSampleData,
    refreshContacts: loadContacts,
  };
}
