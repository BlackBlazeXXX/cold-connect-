# 🧠 PROJECT MEMORY — Cold Connect

## 📌 Project Identity

| Field | Value |
|-------|-------|
| **Name** | Cold Connect |
| **Tagline** | Smart cold outreach for job seekers |
| **Version** | 0.1.0 (Frontend Complete) |
| **Description** | A React + TypeScript application for job seekers to manage cold email outreach to recruiters. Upload CSV/PDF contact lists, compose personalized emails with AI assistance, send via Resend, track replies, and manage follow-ups. |
| **Target User** | Job seekers (software engineers, designers, PMs) doing cold outreach |
| **Primary Goal** | Automate and optimize the "find contact → write email → send → track reply → follow up" loop |

---

## 🛠️ Tech Stack (Locked In)

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| **Frontend Framework** | React | 18.2+ | Functional components, hooks only |
| **Build Tool** | Vite | 6.4+ | Fast HMR, optimized builds |
| **Language** | TypeScript | 5.5+ | **Strict mode** — no `any`, no `as unknown` |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first, dark mode default |
| **Routing** | React Router | 6.22+ | HashRouter for iframe compatibility |
| **State Management** | React Hooks + Context | — | No Redux/Zustand needed yet |
| **Data Fetching** | TanStack Query | 5.17+ | (Planned for backend) |
| **Tables** | TanStack Table | 8.11+ | Headless, sortable, paginated |
| **Date Utils** | date-fns | 3.3+ | Immutable, tree-shakeable |
| **Icons | Lucide React | 0.45+ | Consistent, tree-shakeable |
| **Notifications** | react-hot-toast | 2.4+ | Top-right, dark theme |
| **Validation** | Zod | 3.22+ | All external input (forms, API, env) |
| **PDF Parsing** | pdf-parse | 1.1+ | Server-side only (Edge Function) |
| **CSV Parsing** | PapaParse | 5.4+ | Client-side for preview |
| **Email Sending** | Resend | — | Via Edge Function |
| **AI** | Anthropic Claude | — | Via Edge Function |
| **Database** | Supabase (PostgreSQL) | — | **Not yet connected** |
| **Auth** | Supabase Auth | — | **Not yet connected** |
| **Storage** | Supabase Storage | — | **Not yet connected** |
| **Cron** | pg_cron / Supabase Cron | — | **Not yet configured** |
| **Deploy** | Vercel | — | **Not yet configured** |
| **CI/CD** | GitHub Actions | — | **Not yet configured** |
| **Monitoring** | Sentry + LogRocket | — | **Not yet configured** |

---

## 🏗️ Architecture Decisions

### Frontend (Current State)
- **HashRouter** — Prevents 404s in sandboxed iframe previews
- **Protected Routes** — `ProtectedRoute` wrapper checks auth
- **AppShell Layout** — Sidebar + Header + MobileNav + Content area
- **Feature-First Folder Structure** — `src/pages`, `src/components/{feature}`, `src/hooks`, `src/lib`
- **Co-located Types** — Types live near usage (`src/types/index.ts` for shared)
- **Barrel Files** — `index.ts` exports for stable modules only
- **Named Exports** — Improves IDE refactoring, no default exports

### Backend (Planned)
- **Supabase PostgreSQL** — Primary database
- **Row Level Security (RLS)** — Every table has `user_id`, policies enforce isolation
- **Edge Functions (Deno)** — Serverless, close to user, no cold start issues
- **Resend for Email** — Transactional API, webhook support for tracking
- **Anthropic for AI** — Subject generation, body composition, feedback scoring
- **pg_cron** — Scheduled jobs inside Postgres (no external scheduler needed)
- **Supabase Storage** — Private buckets for resumes, signed URLs for attachments

### Security Defaults
- **Zod on ALL external input** — Forms, API params, env vars, webhook payloads
- **Parameterized Queries** — Supabase client handles this
- **CSP Headers** — Strict, nonce-based for inline scripts
- **CORS** — Whitelist only (Vercel preview + prod domains)
- **Rate Limiting** — Upstash Redis on public endpoints
- **Secrets** — Vercel env vars + Supabase vault, never in code
- **No localStorage for tokens** — httpOnly cookies via Supabase Auth

---

## 📁 Folder Structure (Current)

```
src/
├── App.tsx                      # Routes + providers
├── main.tsx                     # Entry point
├── vite-env.d.ts                # Vite types
├── index.css                    # Tailwind + global styles
├── lib/
│   ├── supabase.ts              # Supabase client (unused yet)
│   ├── resend.ts                # Resend utility (mock)
│   ├── anthropic.ts             # Anthropic utility (mock)
│   ├── emailComposer.ts         # Merge tags + HTML/plain text
│   ├── csvParser.ts             # CSV → contacts
│   ├── pdfParser.ts             # PDF → contacts (server only)
│   └── constants.ts             # Storage keys, app config
├── types/
│   └── index.ts                 # ALL shared TypeScript types
├── hooks/
│   ├── useAuth.ts               # Mock auth (localStorage)
│   ├── useContacts.ts           # Mock contacts (localStorage)
│   ├── useTemplates.ts          # Mock templates
│   ├── useEmailLogs.ts          # Mock email logs
│   ├── useDailyLimit.ts         # Mock daily limit
│   ├── useDashboard.ts          # Mock dashboard stats
│   ├── useSettings.ts           # Mock settings
│   └── useAnalytics.ts          # Mock analytics
├── pages/
│   ├── DashboardPage.tsx        # Stats, quota, follow-ups, activity
│   ├── UploadPage.tsx           # CSV/PDF import wizard
│   ├── ContactsPage.tsx         # Full contact directory
│   ├── TemplatesPage.tsx        # Template CRUD + AI review
│   ├── SendPage.tsx             # Single/bulk send with preview
│   ├── AnalyticsPage.tsx        # Charts + tables
│   ├── SettingsPage.tsx         # All config sections
│   ├── DuesPage.tsx             # NEW: New Leads + Follow-Ups Due tabs
│   └── NotFoundPage.tsx         # 404
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         # Root layout
│   │   ├── Sidebar.tsx          # Desktop nav
│   │   ├── MobileNav.tsx        # Bottom mobile nav
│   │   ├── Header.tsx           # Page title + quick actions
│   │   └── ProtectedRoute.tsx   # Auth guard
│   ├── auth/                    # Login, Signup, ForgotPassword
│   ├── contacts/                # ContactTable, Filters, Drawer, etc.
│   ├── templates/               # Editor, List, Preview, AI Feedback
│   ├── send/                    # Selector, Personalization, Progress, Confirm
│   ├── upload/                  # Zone, Preview, Verification, Summary
│   ├── settings/                # Config sections
│   ├── dashboard/               # StatCard, DailyLimitBar, FollowUpSection, etc.
│   ├── analytics/               # Charts, Tables
│   └── ui/                      # Button, Card, Badge, Tabs, Table, Modal, etc.
└── constants/
    └── constants.ts             # STORAGE_KEYS, APP_CONFIG
```

---

## 🔑 Key Files to Understand

| File | Why It Matters |
|------|----------------|
| `src/types/index.ts` | **Single source of truth** for all data shapes |
| `src/hooks/useContacts.ts` | **Most complex hook** — CRUD, batch, dedup, localStorage fallback, daily new leads |
| `src/lib/emailComposer.ts` | **Merge tag engine** — `{{hr_name}}`, `{{company_name}}`, etc. |
| `src/pages/SendPage.tsx` | **Core workflow** — single + bulk send, preview, confirmation |
| `src/components/contacts/ContactTable.tsx` | **Reusable table** — sorting, pagination, checkboxes, actions |
| `src/pages/DuesPage.tsx` | **Action center** — daily new leads batch, follow-up stages, URL-synced tabs |
| `src/hooks/useAuth.ts` | **Auth gateway** — swap mock for Supabase Auth here |
| `src/components/settings/NewLeadsLimitConfig.tsx` | **Daily leads setting** — configurable 1-25 leads per day |

---

## 🎨 Design System (Locked In)

| Element | Value |
|---------|-------|
| **Primary Color** | Emerald (`#10b981`) |
| **Background** | `#0a0a0a` (near black) |
| **Surface** | `#0c0c0c` (cards) |
| **Border** | `white/5` (subtle) |
| **Text Primary** | `white` |
| **Text Muted** | `zinc-400` / `zinc-500` |
| **Font** | System UI (mono for data) |
| **Radius** | `rounded-xl` (cards), `rounded-lg` (buttons) |
| **Shadow** | `shadow-xs` (subtle depth) |
| **Transitions** | `150ms` default, `300ms` for loading |

---

## 🚫 Anti-Patterns (Enforced)

| Anti-Pattern | Rule |
|--------------|------|
| `any` type | **Forbidden** — use `unknown` + Zod |
| `as unknown as Type` | **Forbidden** — narrow properly |
| Default exports | **Forbidden** — named exports only |
| `var` / `let` (when `const` works) | **Forbidden** — prefer `const` |
| Inline styles | **Forbidden** — Tailwind classes only |
| `console.log` in production | **Forbidden** — use structured logger |
| Direct Supabase calls in components | **Forbidden** — use hooks only |
| Business logic in UI components | **Forbidden** — extract to hooks/lib |

---

## 🔮 Future Systems (From Master Plan)

| Phase | System | Status |
|-------|--------|--------|
| 1 | Stat Cards Upgrade | Pending |
| 2 | Dues & Tasks Page | **DONE** |
| 3 | Dashboard Links to Dues | **DONE** |
| 4 | Daily New Leads Auto-Rotation | **DONE** |
| 5 | Activity Feed Calendar | Pending |
| 6 | Database + Email Engine | Pending (Priority 1) |
| 7 | Webhooks + Queueing | Pending (Priority 1) |

---

*This file is the project's "brain" — update when architecture changes.*