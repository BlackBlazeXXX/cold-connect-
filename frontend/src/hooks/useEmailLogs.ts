// FILE: src/hooks/useEmailLogs.ts
import { useState, useEffect, useCallback } from 'react';
import { EmailLog } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { STORAGE_KEYS } from '../constants/constants';

const SEED_LOGS: Omit<EmailLog, 'user_id'>[] = [
  // ══════════════════════════════════════════════════════════════════════════════
  // EMAIL SENT CONTACTS (7) — Initial emails only, 1-2 days old
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'log_sent_1',
    contact_id: 'c_sent_1',
    template_id: 'tmpl_1',
    subject_used: 'Application for Staff Frontend Engineer — Cold Connect',
    body_used: 'Hi Jennifer,\n\nI hope you are having a great week. I came across Airbnb\'s frontend team...',
    sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_101',
    status: 'sent',
  },
  {
    id: 'log_sent_2',
    contact_id: 'c_sent_2',
    template_id: 'tmpl_1',
    subject_used: 'Application for Product Engineer — Cold Connect',
    body_used: 'Hi Ryan,\n\nI have been following Stripe\'s payment UI innovations...',
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_102',
    status: 'sent',
  },
  {
    id: 'log_sent_3',
    contact_id: 'c_sent_3',
    template_id: 'tmpl_1',
    subject_used: 'Application for Senior UI Developer — Cold Connect',
    body_used: 'Hi Nina,\n\nGreat meeting you at Next.js conf. I am excited about edge rendering...',
    sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_103',
    status: 'sent',
  },
  {
    id: 'log_sent_4',
    contact_id: 'c_sent_4',
    template_id: 'tmpl_1',
    subject_used: 'Application for Frontend Architect — Cold Connect',
    body_used: 'Hi David,\n\nIt was great meeting you at the tech meetup. I am passionate about micro-frontend architecture...',
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_104',
    status: 'sent',
  },
  {
    id: 'log_sent_5',
    contact_id: 'c_sent_5',
    template_id: 'tmpl_1',
    subject_used: 'Application for UI Platform Engineer — Cold Connect',
    body_used: 'Hi Amanda,\n\nI was referred by your colleague. I specialize in canvas rendering...',
    sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_105',
    status: 'sent',
  },
  {
    id: 'log_sent_6',
    contact_id: 'c_sent_6',
    template_id: 'tmpl_1',
    subject_used: 'Application for Senior Software Engineer — Cold Connect',
    body_used: 'Hi Carlos,\n\nI am excited about Slack\'s real-time messaging platform. I have WebSocket expertise...',
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_106',
    status: 'sent',
  },
  {
    id: 'log_sent_7',
    contact_id: 'c_sent_7',
    template_id: 'tmpl_1',
    subject_used: 'Application for Frontend Lead — Cold Connect',
    body_used: 'Hi Lisa,\n\nI loved your talk at YC demo day. I am passionate about collaborative editing...',
    sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_107',
    status: 'sent',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // FOLLOW-UP 1 CONTACTS (3) — Initial + FU1, 3-6 days since initial
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'log_fu1_1a',
    contact_id: 'c_fu1_1',
    template_id: 'tmpl_1',
    subject_used: 'Application for Senior Frontend Developer — Cold Connect',
    body_used: 'Hi Emily,\n\nI hope this email finds you well. I am interested in GitHub\'s Copilot UI...',
    sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_201',
    status: 'sent',
  },
  {
    id: 'log_fu1_1b',
    contact_id: 'c_fu1_1',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Senior Frontend Developer at GitHub',
    body_used: 'Hi Emily,\n\nI wanted to quickly follow up on my previous note about the Copilot UI integration...',
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_202',
    status: 'sent',
  },
  {
    id: 'log_fu1_2a',
    contact_id: 'c_fu1_2',
    template_id: 'tmpl_1',
    subject_used: 'Application for UI Engineer — Cold Connect',
    body_used: 'Hi James,\n\nI am excited about Datadog\'s dashboard visualization work...',
    sent_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_203',
    status: 'sent',
  },
  {
    id: 'log_fu1_2b',
    contact_id: 'c_fu1_2',
    template_id: 'tmpl_2',
    subject_used: 'Following up: UI Engineer at Datadog',
    body_used: 'Hi James,\n\nI wanted to follow up on my application for the UI Engineer position...',
    sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_204',
    status: 'sent',
  },
  {
    id: 'log_fu1_3a',
    contact_id: 'c_fu1_3',
    template_id: 'tmpl_1',
    subject_used: 'Application for Software Engineer — Cold Connect',
    body_used: 'Hi Rachel,\n\nI am passionate about Spotify\'s web player and audio visualization...',
    sent_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_205',
    status: 'sent',
  },
  {
    id: 'log_fu1_3b',
    contact_id: 'c_fu1_3',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Software Engineer at Spotify',
    body_used: 'Hi Rachel,\n\nI wanted to follow up on my application. I have experience with React performance optimization...',
    sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_206',
    status: 'sent',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // FOLLOW-UP 2 CONTACTS (4) — Initial + FU1 + FU2, 7-11 days since initial
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'log_fu2_1a',
    contact_id: 'c_fu2_1',
    template_id: 'tmpl_1',
    subject_used: 'Application for Senior Software Engineer — Cold Connect',
    body_used: 'Hi Tom,\n\nI am excited about Microsoft\'s Azure DevOps UI work...',
    sent_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_301',
    status: 'sent',
  },
  {
    id: 'log_fu2_1b',
    contact_id: 'c_fu2_1',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Senior Software Engineer at Microsoft',
    body_used: 'Hi Tom,\n\nI wanted to follow up on my application for the Senior Software Engineer role...',
    sent_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_302',
    status: 'sent',
  },
  {
    id: 'log_fu2_1c',
    contact_id: 'c_fu2_1',
    template_id: 'tmpl_3',
    subject_used: 'Second follow-up: Azure DevOps UI',
    body_used: 'Hi Tom,\n\nI know you are busy, but I wanted to reach out one more time about the Azure DevOps UI position...',
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_2',
    resend_id: 're_test_303',
    status: 'sent',
  },
  {
    id: 'log_fu2_2a',
    contact_id: 'c_fu2_2',
    template_id: 'tmpl_1',
    subject_used: 'Application for UI Frameworks Engineer — Cold Connect',
    body_used: 'Hi Jessica,\n\nI am passionate about Apple\'s UI frameworks and SwiftUI web bridge...',
    sent_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_304',
    status: 'sent',
  },
  {
    id: 'log_fu2_2b',
    contact_id: 'c_fu2_2',
    template_id: 'tmpl_2',
    subject_used: 'Following up: UI Frameworks Engineer at Apple',
    body_used: 'Hi Jessica,\n\nI wanted to follow up on my application. I have experience with SwiftUI and web technologies...',
    sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_305',
    status: 'sent',
  },
  {
    id: 'log_fu2_2c',
    contact_id: 'c_fu2_2',
    template_id: 'tmpl_3',
    subject_used: 'Second follow-up: UI Frameworks at Apple',
    body_used: 'Hi Jessica,\n\nI know this is a long shot, but I wanted to reach out one more time about the UI Frameworks position...',
    sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_2',
    resend_id: 're_test_306',
    status: 'sent',
  },
  {
    id: 'log_fu2_3a',
    contact_id: 'c_fu2_3',
    template_id: 'tmpl_1',
    subject_used: 'Application for Staff Frontend Engineer — Cold Connect',
    body_used: 'Hi Michael,\n\nI am excited about Uber\'s real-time map rendering work...',
    sent_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_307',
    status: 'sent',
  },
  {
    id: 'log_fu2_3b',
    contact_id: 'c_fu2_3',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Staff Frontend Engineer at Uber',
    body_used: 'Hi Michael,\n\nI wanted to follow up on my application for the Staff Frontend Engineer role...',
    sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_308',
    status: 'sent',
  },
  {
    id: 'log_fu2_3c',
    contact_id: 'c_fu2_3',
    template_id: 'tmpl_3',
    subject_used: 'Second follow-up: Real-time map rendering',
    body_used: 'Hi Michael,\n\nI know you are busy, but I wanted to reach out one more time about the Staff Frontend Engineer position...',
    sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_2',
    resend_id: 're_test_309',
    status: 'sent',
  },
  {
    id: 'log_fu2_4a',
    contact_id: 'c_fu2_4',
    template_id: 'tmpl_1',
    subject_used: 'Application for Senior UI Engineer — Cold Connect',
    body_used: 'Hi Sarah,\n\nI am excited about Airbnb\'s Experiences platform redesign...',
    sent_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_310',
    status: 'sent',
  },
  {
    id: 'log_fu2_4b',
    contact_id: 'c_fu2_4',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Senior UI Engineer at Airbnb',
    body_used: 'Hi Sarah,\n\nI wanted to follow up on my application. I have experience with travel platform UIs...',
    sent_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_311',
    status: 'sent',
  },
  {
    id: 'log_fu2_4c',
    contact_id: 'c_fu2_4',
    template_id: 'tmpl_3',
    subject_used: 'Second follow-up: Experiences platform',
    body_used: 'Hi Sarah,\n\nI know this is a long shot, but I wanted to reach out one more time about the Senior UI Engineer position...',
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_2',
    resend_id: 're_test_312',
    status: 'sent',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // NEVER REPLIED CONTACTS (5) — Initial + FU1 + FU2, 12+ days since initial
  // ══════════════════════════════════════════════════════════════════════════════
  {
    id: 'log_nr_1a',
    contact_id: 'c_nr_1',
    template_id: 'tmpl_1',
    subject_used: 'Application for Senior Frontend Developer — Cold Connect',
    body_used: 'Hi Chris,\n\nI am excited about AWS console\'s frontend architecture...',
    sent_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_401',
    status: 'sent',
  },
  {
    id: 'log_nr_1b',
    contact_id: 'c_nr_1',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Senior Frontend Developer at Amazon',
    body_used: 'Hi Chris,\n\nI wanted to follow up on my application for the Senior Frontend Developer role...',
    sent_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_402',
    status: 'sent',
  },
  {
    id: 'log_nr_1c',
    contact_id: 'c_nr_1',
    template_id: 'tmpl_3',
    subject_used: 'Second follow-up: AWS Console UI',
    body_used: 'Hi Chris,\n\nI know you are busy, but I wanted to reach out one more time about the Senior Frontend Developer position...',
    sent_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_2',
    resend_id: 're_test_403',
    status: 'sent',
  },
  {
    id: 'log_nr_2a',
    contact_id: 'c_nr_2',
    template_id: 'tmpl_1',
    subject_used: 'Application for UI Engineer — Cold Connect',
    body_used: 'Hi Diana,\n\nI am excited about Google Workspace\'s frontend work...',
    sent_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_404',
    status: 'sent',
  },
  {
    id: 'log_nr_2b',
    contact_id: 'c_nr_2',
    template_id: 'tmpl_2',
    subject_used: 'Following up: UI Engineer at Google',
    body_used: 'Hi Diana,\n\nI wanted to follow up on my application for the UI Engineer role...',
    sent_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_405',
    status: 'sent',
  },
  {
    id: 'log_nr_2c',
    contact_id: 'c_nr_2',
    template_id: 'tmpl_3',
    subject_used: 'Second follow-up: Google Workspace UI',
    body_used: 'Hi Diana,\n\nI know this is a long shot, but I wanted to reach out one more time about the UI Engineer position...',
    sent_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_2',
    resend_id: 're_test_406',
    status: 'sent',
  },
  {
    id: 'log_nr_3a',
    contact_id: 'c_nr_3',
    template_id: 'tmpl_1',
    subject_used: 'Application for Software Engineer — Cold Connect',
    body_used: 'Hi Kevin,\n\nI am excited about Instagram\'s frontend work and React Native...',
    sent_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_407',
    status: 'sent',
  },
  {
    id: 'log_nr_4a',
    contact_id: 'c_nr_4',
    template_id: 'tmpl_1',
    subject_used: 'Application for Senior Frontend Architect — Cold Connect',
    body_used: 'Hi Laura,\n\nI am passionate about Twitter\'s frontend architecture and real-time features...',
    sent_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_408',
    status: 'sent',
  },
  {
    id: 'log_nr_4b',
    contact_id: 'c_nr_4',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Senior Frontend Architect at Twitter',
    body_used: 'Hi Laura,\n\nI wanted to follow up on my application for the Senior Frontend Architect role...',
    sent_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_409',
    status: 'sent',
  },
  {
    id: 'log_nr_4c',
    contact_id: 'c_nr_4',
    template_id: 'tmpl_3',
    subject_used: 'Second follow-up: Twitter frontend',
    body_used: 'Hi Laura,\n\nI know you are busy, but I wanted to reach out one more time about the Senior Frontend Architect position...',
    sent_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_2',
    resend_id: 're_test_410',
    status: 'sent',
  },
  {
    id: 'log_nr_5a',
    contact_id: 'c_nr_5',
    template_id: 'tmpl_1',
    subject_used: 'Application for Staff Software Engineer — Cold Connect',
    body_used: 'Hi Brian,\n\nI am excited about LinkedIn\'s frontend engineering and professional networking features...',
    sent_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_test_411',
    status: 'sent',
  },
  {
    id: 'log_nr_5b',
    contact_id: 'c_nr_5',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Staff Software Engineer at LinkedIn',
    body_used: 'Hi Brian,\n\nI wanted to follow up on my application for the Staff Software Engineer role...',
    sent_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_test_412',
    status: 'sent',
  },
  {
    id: 'log_nr_5c',
    contact_id: 'c_nr_5',
    template_id: 'tmpl_3',
    subject_used: 'Second follow-up: LinkedIn frontend',
    body_used: 'Hi Brian,\n\nI know this is a long shot, but I wanted to reach out one more time about the Staff Software Engineer position...',
    sent_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_2',
    resend_id: 're_test_413',
    status: 'sent',
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // REPLIED CONTACTS (5) — Reply detected at different follow-up stages
  // ══════════════════════════════════════════════════════════════════════════════
  // c_reply_1 (Sarah Kim) — replied after INITIAL email (day 1)
  {
    id: 'log_reply_1a',
    contact_id: 'c_reply_1',
    template_id: 'tmpl_1',
    subject_used: 'Application for Senior UI Engineer — Cold Connect',
    body_used: 'Hi Sarah,\n\nI am excited about Netflix\'s UI engineering work on the member experience...',
    sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_reply_101',
    status: 'sent',
  },
  // c_reply_2 (Alex Chen) — replied after FOLLOW-UP 1 (day 5)
  {
    id: 'log_reply_2a',
    contact_id: 'c_reply_2',
    template_id: 'tmpl_1',
    subject_used: 'Application for Frontend Engineer — Cold Connect',
    body_used: 'Hi Alex,\n\nI have been following Apple\'s Safari web engines and was wondering if...',
    sent_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_reply_201',
    status: 'sent',
  },
  {
    id: 'log_reply_2b',
    contact_id: 'c_reply_2',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Frontend Engineer at Apple',
    body_used: 'Hi Alex,\n\nQuick follow-up on my note about the Safari web performance role...',
    sent_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_reply_202',
    status: 'sent',
  },
  // c_reply_3 (Maria Garcia) — replied after FOLLOW-UP 2 (day 9)
  {
    id: 'log_reply_3a',
    contact_id: 'c_reply_3',
    template_id: 'tmpl_1',
    subject_used: 'Application for SDE — Cold Connect',
    body_used: 'Hi Maria,\n\nI am drawn to Amazon\'s scale and engineering culture...',
    sent_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_reply_301',
    status: 'sent',
  },
  {
    id: 'log_reply_3b',
    contact_id: 'c_reply_3',
    template_id: 'tmpl_2',
    subject_used: 'Following up: SDE at Amazon',
    body_used: 'Hi Maria,\n\nFollowing up on my application for the Software Development Engineer role...',
    sent_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_reply_302',
    status: 'sent',
  },
  {
    id: 'log_reply_3c',
    contact_id: 'c_reply_3',
    template_id: 'tmpl_3',
    subject_used: 'Second follow-up: Amazon SDE',
    body_used: 'Hi Maria,\n\nI wanted to reach out one more time about the SDE position...',
    sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_2',
    resend_id: 're_reply_303',
    status: 'sent',
  },
  // c_reply_4 (Tom Lee) — LATE reply (day 15)
  {
    id: 'log_reply_4a',
    contact_id: 'c_reply_4',
    template_id: 'tmpl_1',
    subject_used: 'Application for Product Engineer — Cold Connect',
    body_used: 'Hi Tom,\n\nI have followed Spotify\'s product developments for years...',
    sent_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_reply_401',
    status: 'sent',
  },
  {
    id: 'log_reply_4b',
    contact_id: 'c_reply_4',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Product Engineer at Spotify',
    body_used: 'Hi Tom,\n\nI wanted to follow up on my application for the Product Engineer role...',
    sent_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_reply_402',
    status: 'sent',
  },
  {
    id: 'log_reply_4c',
    contact_id: 'c_reply_4',
    template_id: 'tmpl_3',
    subject_used: 'Second follow-up: Spotify Product Engineer',
    body_used: 'Hi Tom,\n\nOne last note about the Product Engineer position...',
    sent_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_2',
    resend_id: 're_reply_403',
    status: 'sent',
  },
  // c_reply_5 (Jane Doe) — replied after FOLLOW-UP 1 (day 4)
  {
    id: 'log_reply_5a',
    contact_id: 'c_reply_5',
    template_id: 'tmpl_1',
    subject_used: 'Application for Staff UI Engineer — Cold Connect',
    body_used: 'Hi Jane,\n\nI am thrilled about Uber\'s design systems and mapping UI work...',
    sent_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'initial',
    resend_id: 're_reply_501',
    status: 'sent',
  },
  {
    id: 'log_reply_5b',
    contact_id: 'c_reply_5',
    template_id: 'tmpl_2',
    subject_used: 'Following up: Staff UI Engineer at Uber',
    body_used: 'Hi Jane,\n\nQuick follow-up on my application for the Staff UI Engineer role...',
    sent_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    email_type: 'follow_up_1',
    resend_id: 're_reply_502',
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
