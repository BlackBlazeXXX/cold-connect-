# 🏗️ Cold Connect — Backend

**Status:** Scaffold only. No backend work yet (Boss decision: frontend-first).

This folder is the future home of Cold Connect's server-side logic, ready to be deployed to **Railway** (or any Node host).

## What will live here (Phase 2, not yet built)

- **Reply detection** — Resend webhook endpoint (`POST /api/replies`) + Gmail API / IMAP poller
  → calls `markReplyDetected()` from the frontend data layer so replies land in the **Replies Due** tab automatically
- **Email sending** — outbound send API (Resend / Gmail) used by the Send page
- **Gemini personalization proxy** — keeps `GEMINI_API_KEY` on the server, never in the browser

## Local dev

```bash
cd backend
npm install        # not run yet — needs Boss approval when we start Phase 2
npm run dev
```

## Env vars (documented here — no `.env` file created)

| Variable       | Purpose                                       |
|----------------|-----------------------------------------------|
| `PORT`         | HTTP port (default `8080`)                    |
| `DATABASE_URL` | Postgres connection (Supabase/Neon)           |
| `RESEND_API_KEY` | Resend API key for inbound/outbound email   |
| `GEMINI_API_KEY` | Google Gemini key (server-side only)        |
| `CORS_ORIGIN`  | Frontend origin (e.g. `https://app.vercel.app`) |

## Deploy to Railway

1. Push this repo to GitHub.
2. In Railway, create a new project → Deploy from GitHub repo.
3. Root directory: `backend`.
4. Add the env vars above.
5. Railway auto-detects `npm start` (`start` script in `package.json`).