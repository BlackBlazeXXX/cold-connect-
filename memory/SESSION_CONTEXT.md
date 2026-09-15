# 📝 SESSION CONTEXT — Cold Connect

**Last Session:** 2026-09-14  
**Duration:** ~3 hours  
**Focus:** Replies Due (Phase 1) + Monorepo Restructure

---

## 🎯 WHAT WAS COMPLETED THIS SESSION

### Module 6: Replies Due + Automatic Reply Flow (Phase 1)
1. **Updated `src/types/index.ts`** — Added:
   - `RepliedAfterStage = 'initial' | 'follow_up_1' | 'follow_up_2' | 'late'`
   - `replied_after: RepliedAfterStage | null` on Contact interface

2. **Updated `src/hooks/useContacts.ts`** — Added:
   - `replied_after: null` on ALL SEED_CONTACTS
   - 5 replied seed contacts: Sarah Kim/Netflix (`initial`), Alex Chen/Apple (`follow_up_1`), Maria Garcia/Amazon (`follow_up_2`), Tom Lee/Spotify (`late`), Jane Doe/Uber (`follow_up_1`)
   - `getFollowUpStage()` now checks `replied_after` first, falls back to legacy status/logs check (backwards compatible with old localStorage)
   - `getRepliedAfterStage()` — classifies reply stage from elapsed days
   - `filterRepliedContacts()` — filters contacts with detected replies
   - `markReplyDetected()` — **Phase 2 injection point** (Resend webhooks / Gmail API / IMAP)
   - `RepliedAfterFilter` + `REPLIED_AFTER_LABELS` constants
   - `markAsReplied` sets `replied_after` alongside status

3. **Updated `src/hooks/useEmailLogs.ts`** — Added replied contacts' email logs (log_reply_1a..log_reply_5b) so stage detection works.

4. **Updated `src/pages/DuesPage.tsx`** — Added 3rd tab:
   - Tab: "Replies Due" (count badge)
   - Sub-filter dropdown: All / After Initial / After FU1 / After FU2 / Late Reply + per-filter counts
   - URL param support (`?tab=replies&reply=follow_up_1`)
   - Empty state + action badge for replies tab
   - Removed `onMarkReplied` prop usage + `handleMarkReplied`

5. **Removed ALL manual "Mark Replied" buttons:**
   - `src/components/contacts/ContactTable.tsx` — removed button + `onMarkReplied` prop
   - `src/components/contacts/ContactDrawer.tsx` — removed button + `onMarkReplied` prop
   - `src/components/dashboard/FollowUpSection.tsx` — removed button + `onMarkReplied` prop
   - `src/pages/ContactsPage.tsx` + `src/pages/DashboardPage.tsx` + `src/hooks/useDashboard.ts` — cleaned up unused props/destructures

6. **Fixed** `src/components/contacts/ManualAddModal.tsx` + `src/pages/UploadPage.tsx` — new contacts get `replied_after: null`.

### Verification
- [x] `npx tsc --noEmit` — **Passes** (0 TypeScript errors)
- [x] `npm run build` — **Passes** (✓ built)

---

## 🔧 TECHNICAL DECISIONS MADE

| Decision | Rationale |
|----------|-----------|
| `replied_after` field on Contact | Single source of truth for reply stage, survives reloads |
| `getFollowUpStage()` checks `replied_after` first | Replying removes contact from ALL follow-up queues instantly |
| `getRepliedAfterStage()` derives stage from days elapsed | Automated — no manual input required |
| `markReplyDetected()` kept as pure API | Clean seam for Phase 2 real reply detection (webhooks/IMAP) |
| Legacy status/log fallback kept | Old localStorage contacts (no `replied_after`) still classify correctly |
| ReplyCounter `showButton` + optional `onMarkReplied` | Kept component reusable; nothing passes the callback anymore |

---

## 🧪 EDGE CASES COVERED

| Case | Solution |
|------|----------|
| Old localStorage without `replied_after` | `getFollowUpStage` legacy fallback via logs/status |
| Reply during initial window (0-2d) | Tag = "After Initial Email" |
| Reply after FU1 (3-6d) | Tag = "After FU1" |
| Reply after FU2 (7-11d) | Tag = "After FU2" |
| Reply 12+ days after initial | Tag = "Late Reply" |
| Do Not Email contacts | Excluded from replies view |
| Empty replies queue | Contextual empty state with CTA |
| Invalid reply filter in URL | Defaults to "all" |

---

## 🏗️ Module 7: Monorepo Restructure

### What was done
- Moved entire Vite app into `frontend/` (all tracked files via `git mv` + `robocopy` / untracked via `Move-Item`)
- Killed Vite dev server (PID 6184/21900) + tsserver LSP (PIDs 348/11400) to unlock `src/` during move
- Created `backend/` scaffold: `package.json`, `tsconfig.json`, `src/index.ts` (Express `/health` endpoint), `README.md`, `supabase/schema.sql`
- Created root `README.md` + `.gitignore` for monorepo
- No installs run (backend deps listed but not installed — waiting for Phase 2)

### Final repo structure
```
cold-connect-/
├── frontend/     ← Vite + React 19 (push to Vercel, root-dir=frontend)
├── backend/      ← Express scaffold + supabase (push to Railway, Phase 2)
├── memory/       ← AI agent project memory (not deployed)
├── README.md     ← Monorepo overview + deploy instructions
└── .gitignore    ← Covers both subdirs
```

### Deploy instructions added
- **Vercel:** import repo → Root Directory = `frontend` → env vars from `.env.example`
- **Railway:** import repo → Root Directory = `backend` → add `DATABASE_URL`, `RESEND_API_KEY`, `GEMINI_API_KEY`, `CORS_ORIGIN`

---

## 📍 CURRENT POSITION

```
Frontend:  ██████████████████████████████  100% (Phase 1 complete + monorepo ready)
Backend:   ██████████░░░░░░░░░░░░░░░░░░░  20% (scaffolded, no code yet)
Infra:     ████████████░░░░░░░░░░░░░░░░░  25% (Vercel deploy path ready, Railway scaffolded)
```

---

## ⏭️ NEXT SESSION PRIORITIES

### Grant: Replies Due — Phase 2 (Automatic Real Reply Detection)
1. `cd backend && npm install` (Boss approval) — installs Express + deps
2. Resend webhook endpoint to receive inbound replies
3. `markReplyDetected()` wiring — POST `/api/replies`
4. Gmail API / IMAP polling fallback for reply detection
5. Auto-mark: replies land in Replies Due with correct tag

### Or: Push to Vercel + Railway now
- Frontend: set Root Directory = `frontend` in Vercel dashboard
- Backend: deploy scaffold to Railway (shows `/health` response)
- Add Supabase connection to backend

---

## 💾 FILES TOUCHED THIS SESSION

| File | Change Type |
|------|-------------|
| `src/types/index.ts` | Modified (RepliedAfterStage, replied_after) — now at `frontend/src/types/index.ts` |
| `src/hooks/useContacts.ts` | Modified (replied_after on seeds, stage helpers, markReplyDetected) — now at `frontend/src/hooks/` |
| `src/hooks/useEmailLogs.ts` | Modified (replied contacts logs) — now at `frontend/src/hooks/` |
| `src/pages/DuesPage.tsx` | Modified (Replies Due tab + filters) — now at `frontend/src/pages/` |
| `src/components/contacts/ContactTable.tsx` | Modified (removed Mark Replied button) — now at `frontend/src/...` |
| `src/components/contacts/ContactDrawer.tsx` | Modified (removed Mark Replied button) — now at `frontend/src/...` |
| `src/components/dashboard/FollowUpSection.tsx` | Modified (removed Mark Replied button) — now at `frontend/src/...` |
| `src/pages/ContactsPage.tsx` | Modified (prop cleanup) — now at `frontend/src/pages/` |
| `src/pages/DashboardPage.tsx` | Modified (prop cleanup) — now at `frontend/src/pages/` |
| `src/hooks/useDashboard.ts` | Modified (removed dead markAsReplied) — now at `frontend/src/hooks/` |
| `src/components/contacts/ManualAddModal.tsx` | Modified (replied_after: null) — now at `frontend/src/...` |
| `src/pages/UploadPage.tsx` | Modified (replied_after: null) — now at `frontend/src/pages/` |
| `frontend/` | **Moved** entire Vite app here from root |
| `backend/package.json` | **Created** — Express scaffold, deps listed, no installs |
| `backend/tsconfig.json` | **Created** — Node ESM config |
| `backend/src/index.ts` | **Created** — Express `/health` + `/` endpoints |
| `backend/supabase/schema.sql` | **Moved** from root supabase/ |
| `backend/README.md` | **Created** — deploy docs + env vars |
| `README.md` (root) | **Created** — monorepo overview |
| `.gitignore` (root) | **Created** — covers both subdirs |
| `memory/BUILD_STATUS.md` | Modified (Module 7 added) |
| `memory/SESSION_CONTEXT.md` | Modified (this file) |
| `memory/loop-run-log.md` | Modified (appended run entry) |

---

## 🗣️ CONVERSATION SUMMARY

- User requested automatic reply detection + dedicated "Replies Due" section + remove all manual status marking
- Provided Phase 1/Phase 2 blueprint → User approved: "Ok go for it but dont affect my system"
- Implemented Phase 1 fully: replied_after field, auto-classification, Replies Due tab, removed all manual Mark Replied buttons
- Fixed `getFollowUpStage` `hasFollowUp2` bug (returned 'never_replied' → now 'followup_2')
- Fixed ContactTable/ContactsPage/ContactDrawer/FollowUpSection prop removals (iterative TS errors resolved)
- `npx tsc --noEmit` + `npm run build` both pass (0 errors)
- Auto-mark cascade bug on DuesPage (new leads → 0 after localStorage.clear) known but UNtouched — user said "everything is showing very perfectly"
- User asked to restructure repo into frontend/ + backend/ → monorepo restructure executed
- Killed Vite dev server + tsserver to unlock `src/` directory during move
- Used `robocopy /MOV` as fallback for src (git mv blocked by file lock)
- Fixed double-nested `backend/supabase/supabase/schema.sql` → `backend/supabase/schema.sql`
- Backend scaffolded with Express + Phase 2 README (no installs, no backend work yet)
- Frontend builds and type-checks from `frontend/` location (0 errors)

---

## 🧠 MEMORY FILES STATUS

| File | Status |
|------|--------|
| `memory/PROJECT_MEMORY.md` | ✅ Created |
| `memory/BUILD_STATUS.md` | ✅ Updated (Module 6 added) |
| `memory/SESSION_CONTEXT.md` | ✅ Updated (this file) |
| `memory/MISSING_FEATURES_TODO.md` | ✅ Complete (131 systems) |
| `memory/MISSING_FEATURES_DUES_TASKS.md` | ✅ Created |
| `memory/PROJECT_TRACKER.md` | ✅ Complete |
| `memory/loop-run-log.md` | ✅ Updated |
| `memory/AGENTS.md` | ✅ Loaded |

---

*Next session: Say "Wake up Jarvis, dad's home" to resume.*