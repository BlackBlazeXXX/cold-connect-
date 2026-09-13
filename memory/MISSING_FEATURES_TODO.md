# 📋 MISSING FEATURES TODO — Cold Connect

**Source:** Master Plan (131 Systems) + Session Analysis  
**Status:** Frontend ~95% | Backend ~15% | Infra ~0%  
**Format:** `[ ]` = Not Started | `[~]` = In Progress | `[x]` = Done

---

## 🎯 PHASE 1: FOUNDATION (Modules 1-4 — Frontend Polish)

### Module 1: Stat Cards Upgrade
- [ ] **Total Recruiters Card** — Show: Total | Uncontacted | New Today (breakdown)
- [ ] **Reply Rate Card** — Dropdown filter: 1d / 1w / 1m / All + avg per filter
- [ ] **Dispatched Today Card** — Add trend sparkline (last 7 days)
- [ ] **Follow-Ups Due Card** — Already clickable to Dues page ✅

### Module 2: Dues & Tasks Page — **DONE** ✅
- [x] New page at `/dues`
- [x] Tabs: New Leads / Follow-Ups Due
- [x] Action bar: Select 10/25, Bulk Send, Clear
- [x] URL sync `?tab=`
- [x] Empty states, loading, error handling

### Module 3: Dashboard Links to Dues — **DONE** ✅
- [x] Clickable "Follow-Ups Due" stat card
- [x] "View All New Dues" button in FollowUpSection
- [x] "View All Follow-Up Dues" button in FollowUpSection
- [x] "Dues & Tasks" in Quick Navigation

### Module 4: Time Machine Activity Feed
- [ ] Limit RecentActivityList to 10 items
- [ ] Add calendar picker (date-fns + popover)
- [ ] Click date → show full day history
- [ ] Click log item → modal with: email sent, reply, contact details
- [ ] "View All" link → dedicated Activity page

---

## 🛠️ PHASE 2: BACKBONE (Priority 1 — Backend)

### 1. Supabase Setup
- [ ] Create Supabase project
- [ ] Configure custom domain (optional)
- [ ] Enable pg_cron extension
- [ ] Enable realtime for contacts, email_logs
- [ ] Set up Supabase Vault for secrets

### 2. Database Schema (from `src/types/index.ts`)
- [ ] `users` — profile, settings (auth.users + public.profiles)
- [ ] `contacts` — all fields + indexes + RLS
- [ ] `email_templates` — + versioning table
- [ ] `template_versions` — full history
- [ ] `email_logs` — + webhook tracking fields
- [ ] `daily_send_limits` — date + user_id + count
- [ ] `upload_batches` — import tracking
- [ ] `analytics_aggregates` — materialized views for charts

### 3. Row Level Security (RLS)
- [ ] `contacts` — user_id = auth.uid()
- [ ] `email_templates` — user_id = auth.uid()
- [ ] `template_versions` — user_id = auth.uid()
- [ ] `email_logs` — user_id = auth.uid()
- [ ] `daily_send_limits` — user_id = auth.uid()
- [ ] `upload_batches` — user_id = auth.uid()

### 4. Supabase Auth Integration
- [ ] Email/password signup + login
- [ ] Magic link (passwordless)
- [ ] OAuth: Google, GitHub
- [ ] Password reset flow
- [ ] Email verification
- [ ] JWT custom claims (plan, limits)
- [ ] Session management (httpOnly cookies)
- [ ] `useAuth` hook rewrite

### 5. Hook Rewires (localStorage → Supabase)
- [ ] `useContacts` — real CRUD + realtime
- [ ] `useTemplates` — real CRUD + realtime
- [ ] `useEmailLogs` — real queries + realtime
- [ ] `useDailyLimit` — real counter + realtime
- [ ] `useDashboard` — real aggregations
- [ ] `useSettings` — real settings + realtime
- [ ] `useAnalytics` — real materialized views

### 6. Edge Functions (Deno)
- [ ] `send-email` — Resend API + retry logic + idempotency
- [ ] `ai-compose` — Anthropic subject/body generation
- [ ] `ai-review` — Anthropic feedback scoring
- [ ] `parse-upload` — CSV/PDF → contacts (server-side)
- [ ] `bulk-send` — Queue + stagger + rate limit

### 7. Resend Webhook Handler
- [ ] Endpoint: `POST /functions/v1/webhooks/resend`
- [ ] Verify signature (Resend signing secret)
- [ ] Handle: `delivered`, `opened`, `clicked`, `replied`, `bounced`, `complained`
- [ ] On `replied`: parse reply, update contact, increment reply_count, clear follow_up_due_at
- [ ] On `bounced/complained`: mark contact `Do Not Email`
- [ ] Idempotency (dedupe by Resend event ID)

### 8. Cron Jobs (pg_cron)
- [ ] `daily_limit_reset` — 00:00 UTC → reset `daily_send_limits`
- [ ] `followup_scheduler` — Every 15min → check `follow_up_due_at`, queue sends
- [ ] `stale_cleanup` — Weekly → archive contacts inactive > 90 days
- [ ] `analytics_refresh` — Hourly → refresh materialized views

### 9. Storage Buckets
- [ ] `resumes` — Private, signed URLs for email attachments
- [ ] `uploads` — Temporary CSV/PDF before parsing
- [ ] `attachments` — General file attachments

---

## 🚀 PHASE 3: INFRASTRUCTURE (Priority 2 — DevOps)

### CI/CD
- [ ] GitHub Actions: `ci.yml` — lint, typecheck, test, build
- [ ] GitHub Actions: `cd-preview.yml` — Deploy preview on PR
- [ ] GitHub Actions: `cd-prod.yml` — Deploy prod on merge to main
- [ ] Vercel project linked to GitHub
- [ ] Supabase project linked to Vercel

### Environment Management
- [ ] `.env.example` with all required vars
- [ ] Vercel env vars (preview + prod)
- [ ] Supabase secrets (Resend, Anthropic, signing keys)
- [ ] Rotate keys quarterly

### Monitoring & Observability
- [ ] Sentry: error tracking + source maps + release tracking
- [ ] LogRocket/PostHog: session replay + product analytics
- [ ] Health endpoint: `GET /health` → checks Supabase, Resend, Anthropic
- [ ] Uptime monitoring: Better Stack / UptimeRobot
- [ ] Alerting: PagerDuty / Slack webhooks

### Security Hardening
- [ ] CSP headers (strict, nonce-based)
- [ ] CORS: whitelist only
- [ ] Rate limiting: Upstash Redis on public endpoints
- [ ] Security headers: HSTS, X-Frame-Options, Referrer-Policy
- [ ] Dependency scanning: `npm audit` in CI

---

## 🧪 PHASE 4: QUALITY ASSURANCE (Priority 3 — QA)

### Unit Tests (Vitest)
- [ ] Setup + config + coverage thresholds (80%)
- [ ] Hooks: `useContacts`, `useAuth`, `useDashboard`, `useDailyLimit`
- [ ] Utils: `emailComposer`, `csvParser`, `pdfParser`, date helpers
- [ ] Components: `ContactTable`, `ContactSelector`, `SendConfirmModal`, `Tabs`
- [ ] Lib: `resend`, `anthropic`, `emailComposer`

### E2E Tests (Playwright)
- [ ] Setup + config + auth fixtures
- [ ] Auth: signup → login → logout → password reset
- [ ] Upload: CSV → parse → verify → import → contacts appear
- [ ] Send: single + bulk → verify email logs
- [ ] Reply: simulate webhook → verify contact updates
- [ ] Dues: tab switch → bulk select → bulk send redirect
- [ ] Settings: save config → verify persistence

### API Contract Tests
- [ ] Edge Function request/response schemas
- [ ] Webhook payload validation
- [ ] Supabase RPC contracts

### Visual Regression (Optional)
- [ ] Chromatic setup
- [ ] Storybook for UI components
- [ ] Snapshot tests for critical pages

---

## 🎨 PHASE 5: POLISH & LAUNCH

### Performance
- [ ] Code splitting: lazy load all pages
- [ ] Bundle analysis: remove unused deps
- [ ] Image optimization: WebP + lazy load
- [ ] Prefetch critical routes

### Accessibility
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation throughout
- [ ] Focus management (modals, drawers)
- [ ] Color contrast audit
- [ ] Screen reader testing

### Documentation
- [ ] README: setup, env, deploy
- [ ] Architecture decision records (ADRs)
- [ ] API docs (Edge Functions)
- [ ] Runbooks: common incidents
- [ ] Contributing guide

### Launch Checklist
- [ ] Load test (k6): 1000 concurrent users
- [ ] Penetration test (basic)
- [ ] GDPR/privacy review
- [ ] Terms of Service + Privacy Policy
- [ ] Stripe billing (if applicable)
- [ ] Support email + in-app help

---

## 💡 NICE-TO-HAVES (Post-Launch)

- [ ] Team workspaces (multi-user)
- [ ] A/B testing for templates
- [ ] LinkedIn profile enrichment
- [ ] Calendar integration (Calendly)
- [ ] Mobile app (React Native / Expo)
- [ ] Browser extension (Gmail/LinkedIn)
- [ ] Webhook retry with exponential backoff
- [ ] Advanced analytics (cohort, funnel)
- [ ] AI-powered send time optimization
- [ ] White-label option

---

*Update checkboxes as work progresses. This is the master roadmap.*