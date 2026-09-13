# 📋 PROJECT TRACKER — Cold Connect

**Last Updated:** 2026-09-06  
**Current Position:** Frontend ~95% | Backend ~15% | Infra ~0%  
**Overall Real App:** ~35%  
**Next Milestone:** Supabase Schema + Auth + Edge Functions

---

## 📍 WHERE WE ARE RIGHT NOW

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (UI + Logic)        ████████████████████████░░░░  95% │
│  - All pages built & routed                                  │
│  - Dues page with tabs, bulk actions, URL sync               │
│  - Dashboard stat cards clickable, FollowUpSection links     │
│  - TypeScript strict, no `any`, Zod-ready                    │
├─────────────────────────────────────────────────────────────────┤
│  BACKEND (Supabase + Edge)    ████░░░░░░░░░░░░░░░░░░░░░░  15% │
│  - Schema designed (types/index.ts)                          │
│  - localStorage fallback in useContacts/useAuth              │
│  - NO real Supabase connection                               │
│  - NO Edge Functions                                         │
├─────────────────────────────────────────────────────────────────┤
│  INFRA (CI/CD + Deploy)       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0%  │
│  - No GitHub Actions                                         │
│  - No Vercel/Supabase prod config                            │
│  - No monitoring (Sentry/LogRocket)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🥇 PRIORITY 1: BACKEND — Supabase + Edge Functions
*Owner: Backend Engineer | Est: 2-3 weeks | Blockers: None*

| # | Task | Status | Time | Owner | Notes |
|---|------|--------|------|-------|-------|
| 1.1 | **Supabase Project Setup** | `[ ]` | 2h | You/Hire | Create project, get keys, add to `.env` |
| 1.2 | **Database Schema Migration** | `[ ]` | 4h | Backend | Run SQL from `memory/schema.sql` (tables, indexes, RLS) |
| 1.3 | **Row Level Security (RLS)** | `[ ]` | 3h | Backend | Users only see their own contacts, templates, logs |
| 1.4 | **Supabase Auth Integration** | `[ ]` | 4h | Backend | Email/password, magic link, OAuth (Google/GitHub), JWT handling |
| 1.5 | **Wire `useAuth` Hook** | `[ ]` | 2h | Frontend | Replace mock with real Supabase auth |
| 1.6 | **Wire `useContacts` Hook** | `[ ]` | 3h | Frontend | Replace localStorage with Supabase queries |
| 1.7 | **Wire `useTemplates` Hook** | `[ ]` | 2h | Frontend | Real CRUD for templates |
| 1.8 | **Wire `useEmailLogs` Hook** | `[ ]` | 2h | Frontend | Real email log queries |
| 1.9 | **Edge Function: `send-email`** | `[ ]` | 6h | Backend | Calls Resend API, handles retries, returns tracking ID |
| 1.10 | **Edge Function: `ai-compose`** | `[ ]` | 4h | Backend | Anthropic API for subject/body generation |
| 1.11 | **Edge Function: `ai-review`** | `[ ]` | 3h | Backend | Anthropic API for email feedback scoring |
| 1.12 | **Resend Webhook Endpoint** | `[ ]` | 4h | Backend | `POST /webhooks/resend` — handles delivered, opened, clicked, replied, bounced |
| 1.13 | **Reply Parsing Logic** | `[ ]` | 3h | Backend | Extract reply from webhook, update contact status, increment reply_count |
| 1.14 | **Cron: Daily Limit Reset** | `[ ]` | 1h | Backend | `pg_cron` at 00:00 UTC — reset `daily_email_limit` |
| 1.15 | **Cron: Follow-up Scheduler** | `[ ]` | 2h | Backend | Every 15min — check `follow_up_due_at`, queue sends |
| 1.16 | **Cron: Stale Contact Cleanup** | `[ ]` | 1h | Backend | Weekly — archive contacts with no activity > 90 days |
| 1.17 | **Storage Bucket: Resumes** | `[ ]` | 1h | Backend | Private bucket, signed URLs for attachments |
| 1.18 | **Storage Bucket: Uploads** | `[ ]` | 1h | Backend | CSV/PDF temp storage before parsing |

---

## 🥈 PRIORITY 2: DEVOPS / INFRASTRUCTURE
*Owner: DevOps Engineer | Est: 3-5 days | Blockers: Priority 1.1–1.4*

| # | Task | Status | Time | Owner | Notes |
|---|------|--------|------|-------|-------|
| 2.1 | **GitHub Actions: CI** | `[ ]` | 2h | DevOps | Lint, typecheck, test on every PR |
| 2.2 | **GitHub Actions: CD (Preview)** | `[ ]` | 2h | DevOps | Deploy preview to Vercel on PR |
| 2.3 | **GitHub Actions: CD (Production)** | `[ ]` | 1h | DevOps | Deploy to Vercel prod on merge to main |
| 2.4 | **Vercel + Supabase Link** | `[ ]` | 1h | DevOps | Connect Vercel project to Supabase |
| 2.5 | **Environment Variables** | `[ ]` | 1h | DevOps | Sync `.env` to Vercel + Supabase secrets |
| 2.6 | **Sentry Integration** | `[ ]` | 2h | DevOps | Error tracking, source maps, release tracking |
| 2.7 | **LogRocket / PostHog** | `[ ]` | 2h | DevOps | Session replay + product analytics |
| 2.8 | **Health Check Endpoint** | `[ ]` | 1h | Backend | `GET /health` — checks Supabase, Resend, Anthropic |
| 2.9 | **Uptime Monitoring** | `[ ]` | 1h | DevOps | UptimeRobot / Better Stack pinging health endpoint |
| 2.10 | **Rate Limiting (Upstash Redis)** | `[ ]` | 2h | Backend | Protect public APIs (webhooks, auth) |

---

## 🥉 PRIORITY 3: QA / TESTING
*Owner: QA Engineer | Est: 1-2 weeks | Blockers: Priority 1.1–1.8*

| # | Task | Status | Time | Owner | Notes |
|---|------|--------|------|-------|-------|
| 3.1 | **Vitest Setup** | `[ ]` | 2h | QA | Config, coverage thresholds |
| 3.2 | **Unit Tests: Hooks** | `[ ]` | 4h | QA | `useContacts`, `useAuth`, `useDashboard`, `useDailyLimit` |
| 3.3 | **Unit Tests: Utils** | `[ ]` | 3h | QA | `emailComposer`, `csvParser`, `pdfParser`, date helpers |
| 3.4 | **Unit Tests: Components** | `[ ]` | 6h | QA | `ContactTable`, `ContactSelector`, `SendConfirmModal`, `Tabs` |
| 3.5 | **Playwright E2E Setup** | `[ ]` | 2h | QA | Config, base URL, auth fixtures |
| 3.6 | **E2E: Auth Flow** | `[ ]` | 3h | QA | Signup → login → logout → password reset |
| 3.7 | **E2E: Upload → Parse → Import** | `[ ]` | 4h | QA | CSV upload → verification → import → contacts appear |
| 3.8 | **E2E: Send Campaign** | `[ ]` | 4h | QA | Single send + bulk send → verify email logs |
| 3.9 | **E2E: Reply Tracking** | `[ ]` | 3h | QA | Simulate webhook → verify contact status updates |
| 3.10 | **E2E: Dues Page** | `[ ]` | 2h | QA | Tab switching, bulk select, bulk send redirect |
| 3.11 | **API Contract Tests** | `[ ]` | 3h | QA | Edge Function schemas, webhook payloads |
| 3.12 | **Visual Regression (Chromatic)** | `[ ]` | 2h | QA | Optional — catch UI drift |

---

## ✅ FRONTEND — ALREADY DONE (Reference)

| Area | Status | Key Files |
|------|--------|-----------|
| **Routing & Layout** | `[x]` | `App.tsx`, `AppShell.tsx`, `Sidebar.tsx`, `MobileNav.tsx`, `Header.tsx` |
| **Auth Pages** | `[x]` | `LoginPage`, `SignupPage`, `ForgotPassword` |
| **Dashboard** | `[x]` | `DashboardPage`, `DailyLimitBar`, `FollowUpSection`, `QuickSendCard`, `RecentActivityList` |
| **Contacts** | `[x]` | `ContactsPage`, `ContactTable`, `ContactFilters`, `ContactDrawer`, `ManualAddModal` |
| **Templates** | `[x]` | `TemplatesPage`, `TemplateEditor`, `TemplateList`, `VersionHistory`, `AIFeedbackPanel` |
| **Send Page** | `[x]` | `SendPage`, `ContactSelector`, `PersonalizationCard`, `SendProgressBar`, `SendConfirmModal` |
| **Analytics** | `[x]` | `AnalyticsPage`, `FunnelChart`, `DailyVolumeChart`, `TemplatePerformance`, `TopCompaniesTable` |
| **Settings** | `[x]` | `SettingsPage`, `ResendConfig`, `AnthropicConfig`, `DailyLimitConfig`, `FollowUpIntervalConfig`, `ResumeConfig`, `DataManagement` |
| **Upload** | `[x]` | `UploadPage`, `UploadZone`, `ExtractionPreview`, `VerificationTable`, `ImportSummary`, `DuplicateWarning` |
| **NEW: Dues Page** | `[x]` | `DuesPage.tsx` — tabs, bulk actions, URL sync |
| **UI Components** | `[x]` | Button, Card, Badge, Tabs, Table, Modal, Drawer, Spinner, Tooltip, Select, Input, Textarea, ProgressBar, StatCard, EmptyState, ErrorBoundary |

---

## 📅 WEEK-BY-WEEK SPRINT PLAN

| Week | Focus | Deliverable |
|------|-------|-------------|
| **1** | Backbone | Supabase project, schema, auth, `useAuth` wired |
| **2** | Data Layer | `useContacts`, `useTemplates`, `useEmailLogs` wired, RLS verified |
| **3** | Email Engine | `send-email` Edge Function, Resend webhook, reply parsing |
| **4** | AI + Scheduling | `ai-compose`, `ai-review` Edge Functions, cron jobs |
| **5** | Files + Storage | Resume upload, CSV/PDF import to Supabase Storage |
| **6** | DevOps | CI/CD, Vercel deploy, Sentry, LogRocket, health checks |
| **7** | Testing | Vitest + Playwright coverage > 80% |
| **8** | Launch Polish | Rate limiting, security audit, load test, docs |

---

## 🔗 QUICK LINKS TO CODEBASE

| Area | File |
|------|------|
| Types (Schema Source) | `src/types/index.ts` |
| Supabase Client | `src/lib/supabase.ts` |
| Auth Hook | `src/hooks/useAuth.ts` |
| Contacts Hook | `src/hooks/useContacts.ts` |
| Templates Hook | `src/hooks/useTemplates.ts` |
| Email Logs Hook | `src/hooks/useEmailLogs.ts` |
| Daily Limit Hook | `src/hooks/useDailyLimit.ts` |
| Dashboard Hook | `src/hooks/useDashboard.ts` |
| Email Composer | `src/lib/emailComposer.ts` |
| Resend Utility | `src/lib/resend.ts` |
| AI (Anthropic) | `src/lib/anthropic.ts` |
| CSV Parser | `src/lib/csvParser.ts` |
| PDF Parser | `src/lib/pdfParser.ts` |
| Dues Page | `src/pages/DuesPage.tsx` |
| Dashboard | `src/pages/DashboardPage.tsx` |
| Send Page | `src/pages/SendPage.tsx` |

---

## 📝 HOW TO USE THIS TRACKER

1. **Open this file** in your editor (VS Code / Cursor)
2. **When a task is done** → change `[ ]` to `[x]`
3. **Add notes** in the Notes column if needed
4. **Commit the change** — it's your source of truth
5. **Next session** → I read this file and know exactly where we are

---

## 🗣️ SESSION START COMMANDS

| Say This | I Do This |
|----------|-----------|
| `"Wake up Jarvis, dad's home"` | Read ALL memory files, report status, wait for next command |
| `"Continue from tracker"` | Read this file, resume from first unchecked task |
| `"Start Priority 1.2"` | Jump to specific task, verify prerequisites done |
| `"Update tracker"` | I tick completed items, update BUILD_STATUS.md, log session |

---

*Generated by Jarvis — Session memory persists in `memory/` folder*