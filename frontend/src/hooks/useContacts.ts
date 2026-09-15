// FILE: src/hooks/useContacts.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Contact, ContactStatus, EmailLog, RepliedAfterStage } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { STORAGE_KEYS } from '../constants/constants';
import { APP_CONFIG } from '../constants/constants';
import { differenceInDays, startOfDay } from 'date-fns';

const SEED_CONTACTS: Omit<Contact, 'user_id'>[] = [
  // ══════════════════════════════════════════════════════════════════════════════
  // NEW LEADS (4) — Stage: "new" — Never contacted, show in daily batch
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'c_new_1',
    hr_name: 'Alex Thompson',
    company_name: 'Shopify',
    email: 'alex.t@shopify.com',
    job_role: 'Senior Frontend Engineer',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Met at React Conf 2026. Interested in performance optimization.',
    do_not_email: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_0',
  },
  {
    id: 'c_new_2',
    hr_name: 'Priya Sharma',
    company_name: 'Atlassian',
    email: 'priya.s@atlassian.com',
    job_role: 'Full Stack Developer',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Referral from LinkedIn. Team hiring for Confluence frontend.',
    do_not_email: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_0',
  },
  {
    id: 'c_new_3',
    hr_name: 'Marcus Johnson',
    company_name: 'Twilio',
    email: 'marcus.j@twilio.com',
    job_role: 'UI Engineer',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'From AngelList. Building communications dashboard.',
    do_not_email: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_0',
  },
  {
    id: 'c_new_4',
    hr_name: 'Sofia Rodriguez',
    company_name: 'Canva',
    email: 'sofia.r@canva.com',
    job_role: 'Design Engineer',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Hackathon judge. Impressed by portfolio work.',
    do_not_email: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'manual',
    upload_batch_id: null,
  },
  {
    id: 'c_new_5',
    hr_name: 'Daniel Park',
    company_name: 'Discord',
    email: 'daniel.p@discord.com',
    job_role: 'Frontend Engineer',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Met at gaming dev conference. Building real-time chat UI.',
    do_not_email: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_0',
  },
  {
    id: 'c_new_6',
    hr_name: 'Olivia Turner',
    company_name: 'Snap',
    email: 'olivia.t@snap.com',
    job_role: 'AR/VR Frontend Developer',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'LinkedIn connection. Working on Snap AR Lens Studio web tools.',
    do_not_email: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_0',
  },
  {
    id: 'c_new_7',
    hr_name: 'Ethan Brooks',
    company_name: 'Stripe',
    email: 'ethan.b@stripe.com',
    job_role: 'Payments UI Engineer',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'From React Summit. Interested in checkout flow optimization.',
    do_not_email: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'manual',
    upload_batch_id: null,
  },
  {
    id: 'c_new_8',
    hr_name: 'Mia Campbell',
    company_name: 'Dropbox',
    email: 'mia.c@dropbox.com',
    job_role: 'Software Engineer, Web',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Referral from former colleague. Building collaborative editing features.',
    do_not_email: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_0',
  },
  {
    id: 'c_new_9',
    hr_name: 'Liam Foster',
    company_name: 'Square',
    email: 'liam.f@squareup.com',
    job_role: 'Senior UI Developer',
    status: 'New',
    reply_count: 0,
    last_sent_at: null,
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Met at fintech meetup. Building merchant dashboard.',
    do_not_email: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_0',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // EMAIL SENT (7) — Stage: "email_sent" — Initial email sent, waiting 3 days
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'c_sent_1',
    hr_name: 'Jennifer Lee',
    company_name: 'Airbnb',
    email: 'jennifer.l@airbnb.com',
    job_role: 'Staff Frontend Engineer',
    status: 'Email Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Applied via referral. Strong React + GraphQL background.',
    do_not_email: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_1',
  },
  {
    id: 'c_sent_2',
    hr_name: 'Ryan O\'Brien',
    company_name: 'Stripe',
    email: 'ryan.o@stripe.com',
    job_role: 'Product Engineer',
    status: 'Email Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Cold outreach. Highlighted payment UI expertise.',
    do_not_email: false,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_1',
  },
  {
    id: 'c_sent_3',
    hr_name: 'Nina Petrov',
    company_name: 'Vercel',
    email: 'nina.p@vercel.com',
    job_role: 'Senior UI Developer',
    status: 'Email Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'From Next.js conf. Interested in edge rendering.',
    do_not_email: false,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_1',
  },
  {
    id: 'c_sent_4',
    hr_name: 'David Kim',
    company_name: 'Netflix',
    email: 'david.k@netflix.com',
    job_role: 'Frontend Architect',
    status: 'Email Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Met at tech meetup. Discussing micro-frontend architecture.',
    do_not_email: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'manual',
    upload_batch_id: null,
  },
  {
    id: 'c_sent_5',
    hr_name: 'Amanda Chen',
    company_name: 'Figma',
    email: 'amanda.c@figma.com',
    job_role: 'UI Platform Engineer',
    status: 'Email Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Referral from current employee. Canvas rendering specialist.',
    do_not_email: false,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_1',
  },
  {
    id: 'c_sent_6',
    hr_name: 'Carlos Mendez',
    company_name: 'Slack',
    email: 'carlos.m@slack.com',
    job_role: 'Senior Software Engineer',
    status: 'Email Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Applied to real-time messaging team. WebSocket expertise.',
    do_not_email: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_1',
  },
  {
    id: 'c_sent_7',
    hr_name: 'Lisa Wang',
    company_name: 'Notion',
    email: 'lisa.w@makenotion.com',
    job_role: 'Frontend Lead',
    status: 'Email Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'From YC demo day. Building collaborative editing features.',
    do_not_email: false,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_1',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // FOLLOW-UP 1 (3) — Stage: "followup_1" — 3-6 days since initial, FU1 eligible
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'c_fu1_1',
    hr_name: 'Emily Davis',
    company_name: 'GitHub',
    email: 'emily.d@github.com',
    job_role: 'Senior Frontend Developer',
    status: 'Follow-Up 1 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_shown_at: null,
    notes: 'Follow-up sent. Mentioned Copilot UI integration project.',
    do_not_email: false,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_2',
  },
  {
    id: 'c_fu1_2',
    hr_name: 'James Wilson',
    company_name: 'Datadog',
    email: 'james.w@datadoghq.com',
    job_role: 'UI Engineer',
    status: 'Follow-Up 1 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_shown_at: null,
    notes: 'Follow-up highlighting dashboard visualization experience.',
    do_not_email: false,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_2',
  },
  {
    id: 'c_fu1_3',
    hr_name: 'Rachel Green',
    company_name: 'Spotify',
    email: 'rachel.g@spotify.com',
    job_role: 'Software Engineer, Web Player',
    status: 'Follow-Up 1 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_shown_at: null,
    notes: 'Follow-up sent. Discussed audio visualization and React performance.',
    do_not_email: false,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_2',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // FOLLOW-UP 2 (4) — Stage: "followup_2" — 7-11 days since initial, FU2 eligible
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'c_fu2_1',
    hr_name: 'Tom Anderson',
    company_name: 'Microsoft',
    email: 'tom.a@microsoft.com',
    job_role: 'Senior Software Engineer',
    status: 'Follow-Up 2 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_shown_at: null,
    notes: 'Second follow-up. Mentioned Azure DevOps UI work.',
    do_not_email: false,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_3',
  },
  {
    id: 'c_fu2_2',
    hr_name: 'Jessica Brown',
    company_name: 'Apple',
    email: 'jessica.b@apple.com',
    job_role: 'UI Frameworks Engineer',
    status: 'Follow-Up 2 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_shown_at: null,
    notes: 'Second follow-up. Highlighted SwiftUI web bridge experience.',
    do_not_email: false,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_3',
  },
  {
    id: 'c_fu2_3',
    hr_name: 'Michael Zhang',
    company_name: 'Uber',
    email: 'michael.z@uber.com',
    job_role: 'Staff Frontend Engineer',
    status: 'Follow-Up 2 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_shown_at: null,
    notes: 'Second follow-up. Discussed real-time map rendering.',
    do_not_email: false,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_3',
  },
  {
    id: 'c_fu2_4',
    hr_name: 'Sarah Martinez',
    company_name: 'Airbnb',
    email: 'sarah.m@airbnb.com',
    job_role: 'Senior UI Engineer',
    status: 'Follow-Up 2 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    last_shown_at: null,
    notes: 'Second follow-up. Mentioned Experiences platform redesign.',
    do_not_email: false,
    created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_3',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // NEVER REPLIED (5) — Stage: "never_replied" — 12+ days, all follow-ups done
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'c_nr_1',
    hr_name: 'Chris Taylor',
    company_name: 'Amazon',
    email: 'chris.t@amazon.com',
    job_role: 'Senior Frontend Developer',
    status: 'Follow-Up 2 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'No response after 2 follow-ups. AWS console team.',
    do_not_email: false,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_4',
  },
  {
    id: 'c_nr_2',
    hr_name: 'Diana Prince',
    company_name: 'Google',
    email: 'diana.p@google.com',
    job_role: 'UI Engineer, Workspace',
    status: 'Follow-Up 2 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'No response. Applied through referral portal.',
    do_not_email: false,
    created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_4',
  },
  {
    id: 'c_nr_3',
    hr_name: 'Kevin Lee',
    company_name: 'Meta',
    email: 'kevin.l@meta.com',
    job_role: 'Software Engineer, Instagram',
    status: 'Email Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Initial email only, no follow-ups sent. 12+ days passed.',
    do_not_email: false,
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_4',
  },
  {
    id: 'c_nr_4',
    hr_name: 'Laura Wilson',
    company_name: 'Twitter',
    email: 'laura.w@twitter.com',
    job_role: 'Senior Frontend Architect',
    status: 'Follow-Up 2 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'No response. Hiring frozen for frontend roles.',
    do_not_email: false,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_4',
  },
  {
    id: 'c_nr_5',
    hr_name: 'Brian Chen',
    company_name: 'LinkedIn',
    email: 'brian.c@linkedin.com',
    job_role: 'Staff Software Engineer',
    status: 'Follow-Up 2 Sent',
    reply_count: 0,
    last_sent_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: null,
    replied_after: null,
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'No response after full cycle. Internal candidate preferred.',
    do_not_email: false,
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_4',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // REPLIED (5) — Stage: "replied" — Reply detected at different follow-up stages
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'c_reply_1',
    hr_name: 'Sarah Kim',
    company_name: 'Netflix',
    email: 'sarah.k@netflix.com',
    job_role: 'Senior UI Engineer',
    status: 'Replied',
    reply_count: 1,
    last_sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
    replied_after: 'initial',
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Replied to initial email. Interested in interview.',
    do_not_email: false,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_5',
  },
  {
    id: 'c_reply_2',
    hr_name: 'Alex Chen',
    company_name: 'Apple',
    email: 'alex.c@apple.com',
    job_role: 'Frontend Engineer, Safari',
    status: 'Replied',
    reply_count: 1,
    last_sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    replied_after: 'follow_up_1',
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Reply after FU1. Interested in web performance role.',
    do_not_email: false,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_5',
  },
  {
    id: 'c_reply_3',
    hr_name: 'Maria Garcia',
    company_name: 'Amazon',
    email: 'maria.g@amazon.com',
    job_role: 'Software Development Engineer',
    status: 'Replied',
    reply_count: 1,
    last_sent_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    replied_after: 'follow_up_2',
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Reply after FU2. Asked for more details.',
    do_not_email: false,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_5',
  },
  {
    id: 'c_reply_4',
    hr_name: 'Tom Lee',
    company_name: 'Spotify',
    email: 'tom.l@spotify.com',
    job_role: 'Product Engineer',
    status: 'Replied',
    reply_count: 1,
    last_sent_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    replied_after: 'late',
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Late reply after full follow-up cycle. Resume in inbox.',
    do_not_email: false,
    created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_5',
  },
  {
    id: 'c_reply_5',
    hr_name: 'Jane Doe',
    company_name: 'Uber',
    email: 'jane.d@uber.com',
    job_role: 'Staff UI Engineer',
    status: 'Replied',
    reply_count: 1,
    last_sent_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    last_replied_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    replied_after: 'follow_up_1',
    follow_up_due_at: null,
    last_shown_at: null,
    notes: 'Reply after FU1. Wants to schedule a call.',
    do_not_email: false,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'csv',
    upload_batch_id: 'batch_test_5',
  },
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
  if (contact.replied_after !== null && contact.replied_after !== undefined) return 'replied';
  if (contact.status === 'Replied' || (contact.reply_count > 0 && contact.last_replied_at)) return 'replied';

  const hasInitialEmail = emailLogs.some((l) => l.contact_id === contact.id && l.email_type === 'initial');
  if (!hasInitialEmail && !contact.last_sent_at) return 'new';

  const hasFollowUp1 = emailLogs.some((l) => l.contact_id === contact.id && l.email_type === 'follow_up_1');
  const hasFollowUp2 = emailLogs.some((l) => l.contact_id === contact.id && l.email_type === 'follow_up_2');

  const daysSinceInitial = getDaysSinceInitial(emailLogs, contact.id, now);

  // After 12 days with no reply → Never Replied
  if (daysSinceInitial !== null && daysSinceInitial >= 12) return 'never_replied';

  // Has follow-up 2 sent → Follow-Up 2 stage (still in follow-up sequence)
  if (hasFollowUp2) return 'followup_2';

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

// ──────────────────────────────────────────────────────────────
// REPLIES DUE — Reply stage classification helpers
// ──────────────────────────────────────────────────────────────

export type RepliedAfterFilter = 'all' | RepliedAfterStage;

export const REPLIED_AFTER_LABELS: Record<RepliedAfterStage, string> = {
  initial: 'After Initial Email',
  follow_up_1: 'After Follow-Up 1',
  follow_up_2: 'After Follow-Up 2',
  late: 'Late Reply',
};

// Determine which stage the contact was in when they replied.
// Uses last_replied_at + the email log timeline to auto-classify.
export function getRepliedAfterStage(
  contact: Contact,
  emailLogs: EmailLog[],
  now: Date = new Date()
): RepliedAfterStage | null {
  if (contact.replied_after !== null && contact.replied_after !== undefined) {
    return contact.replied_after;
  }

  // Fallback: auto-classify from email logs if replied_after is stale/missing
  if (!contact.last_replied_at || contact.reply_count === 0) return null;

  const initialLog = getInitialEmailLog(emailLogs, contact.id);
  if (!initialLog) return null;

  const replyDate = new Date(contact.last_replied_at);
  const initialDate = new Date(initialLog.sent_at);
  const daysAtReply = differenceInDays(replyDate, initialDate);

  const hasFu1 = emailLogs.some((l) => l.contact_id === contact.id && l.email_type === 'follow_up_1');
  const hasFu2 = emailLogs.some((l) => l.contact_id === contact.id && l.email_type === 'follow_up_2');

  if (daysAtReply >= 12) return 'late';
  if (hasFu2) return 'follow_up_2';
  if (hasFu1) return 'follow_up_1';
  return 'initial';
}

export function filterRepliedContacts(
  contacts: Contact[],
  emailLogs: EmailLog[],
  filter: RepliedAfterFilter = 'all',
  now: Date = new Date()
): Contact[] {
  return contacts.filter((c) => {
    const stage = getFollowUpStage(c, emailLogs, now);
    if (stage !== 'replied') return false;
    if (filter === 'all') return true;
    return getRepliedAfterStage(c, emailLogs, now) === filter;
  });
}

// Injection point for Phase 2 reply sources (Resend webhooks / Gmail API / IMAP).
// When ANY source detects a reply, call this to auto-classify the contact.
export async function markReplyDetected(
  contactId: string,
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>,
  emailLogs: EmailLog[],
  contacts: Contact[],
  now: Date = new Date()
): Promise<void> {
  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) return;

  const repliedAfter = getRepliedAfterStage(contact, emailLogs, now);
  const updates: Partial<Contact> = {
    reply_count: (contact.reply_count || 0) + 1,
    last_replied_at: now.toISOString(),
    replied_after: repliedAfter,
    status: 'Replied' as ContactStatus,
    follow_up_due_at: null,
  };

  await updateContact(contactId, updates);
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
      replied_after: contact.replied_after || null, // auto-classified on display via getRepliedAfterStage
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
