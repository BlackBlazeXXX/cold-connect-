# 🎯 LOOP TRIAGE SKILL — Daily Session Startup

**Purpose:** Standardized procedure to start every coding session correctly.

---

## 🔄 TRIGGER

**Auto-runs on:** `"Wake up Jarvis, dad's home"`

---

## 📋 PROCEDURE

### Step 1: Read All Memory Files (Parallel)
```
Read simultaneously:
- memory/PROJECT_MEMORY.md
- memory/BUILD_STATUS.md
- memory/SESSION_CONTEXT.md
- memory/PROJECT_TRACKER.md
- memory/MISSING_FEATURES_TODO.md
- memory/loop-run-log.md
- memory/AGENTS.md
```

### Step 2: Synthesize State
**Extract:**
- Current position (frontend/backend/infra %)
- Last completed module
- Next priority module
- Blockers
- Files touched last session

### Step 3: Report to Boss (Concise)
```
Format:
"Wake up complete. 

**Position:** Frontend 95% | Backend 15% | Infra 0%
**Last Session:** Module 2 + 3 complete (Dues page + Dashboard links)
**Next Priority:** Module 5 — Supabase Schema + Auth + Edge Functions
**Blockers:** None
**Ready for:** Your command"
```

### Step 4: Wait for Direction
**Do NOT:**
- Start coding
- Pick a task
- Make assumptions

**Do:**
- Present status
- Ask: "What's next, Boss?"

---

## 🚨 EMERGENCY TRIAGE (If Things Broken)

### If Build Failing:
1. Read error
2. Check `BUILD_STATUS.md` for known issues
3. Report: "Build broken — [error]. Known? [yes/no]. Fix or escalate?"

### If Tests Failing:
1. Check `MISSING_FEATURES_TODO.md` QA section
2. Report: "Tests failing — [details]. Blocking?"

### If Memory Files Missing:
1. Recreate from `PROJECT_MEMORY.md` + `BUILD_STATUS.md`
2. Report: "Memory partial — reconstructed from available files"

---

## 📝 END-OF-SESSION RITUAL

**Before closing, auto-run:**

1. **Update `PROJECT_TRACKER.md`** — Tick `[x]` for completed tasks
2. **Update `BUILD_STATUS.md`** — Add module completion row
3. **Write `SESSION_CONTEXT.md`** — Full session summary
4. **Append `loop-run-log.md`** — One-line entry
5. **Commit memory files** (if git repo)

---

## 🎯 TRIAGE DECISION MATRIX

| Situation | Action |
|-----------|--------|
| Boss says "Continue" | Resume from first unchecked task in `PROJECT_TRACKER.md` |
| Boss says "Module X" | Verify prerequisites done → Start Module X |
| Boss says "Fix Y" | Analyze Y → Propose fix → Wait for approval |
| Boss says "Explain Z" | Generate full explanation per template |
| No Boss input | Wait silently |

---

## ⚡ QUICK COMMANDS REFERENCE

| Boss Says | Agent Does |
|-----------|------------|
| `"Wake up Jarvis, dad's home"` | Full triage + report + wait |
| `"Continue from tracker"` | Resume first unchecked task |
| `"Start Module 5"` | Verify deps → Begin Module 5 |
| `"Fix the build"` | Diagnose → Propose exact fix |
| `"Update tracker"` | Tick completed + log session |
| `"Explain p2#12"` | Generate 19-section system explanation |

---

*This skill ensures zero context loss between sessions.*