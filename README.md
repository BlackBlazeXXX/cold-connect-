# 🚀 Cold Connect — Monorepo

**Your AI-Powered Cold Outreach Assistant**

Two deployable apps in one repo:

```
cold-connect-/
├── frontend/   → Vite + React 19 + TypeScript app   (deploy to Vercel)
├── backend/    → Node + Express API (Phase 2 stub)   (deploy to Railway)
├── supabase/   → database schema (inside backend/)
├── memory/     → AI agent project memory (not part of the app)
└── .gitignore  → monorepo ignores
```

## Frontend (Vercel)

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
npm run build        # production build → dist/
npm run lint         # tsc --noEmit
```

**Deploy to Vercel:** import this GitHub repo → set **Root Directory = `frontend`**.
Env vars (from `frontend/.env.example`): no secrets needed to run on mock localStorage data.

## Backend (Railway — Phase 2, not built yet)

See `backend/README.md`. Currently a `/health` scaffold only; reply detection + send APIs come later.

## Agent memory

`memory/` holds the project memory system (BUILD_STATUS, SESSION_CONTEXT, run log). Not deployed.

---

*Built with ❤️ for modern outreach.*