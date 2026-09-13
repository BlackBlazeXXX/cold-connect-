# 📋 MISSING FEATURES — Dues & Tasks Redesign

**Feature:** Redesign Cold Connect outreach workflow around the "Dues & Tasks" page  
**Date:** 2026-09-11  
**Status:** `[ ]` = Not Started | `[~]` = In Progress | `[x]` = Done  
**Priority:** Frontend + Logic overhaul (no visual redesign)

---

## 🔑 CORE REQUIREMENT

Update the underlying filtering/state logic so the data shown in each section is based on the contact's **email history, last sent email date, reply status, and follow-up stage** — not just a single `status` field.

---

## 1. REMOVE THE "FOLLOW-UP REMINDERS" SECTION FROM DASHBOARD

### What to Remove
- [x] Remove the entire `FollowUpSection` component from `src/pages/DashboardPage.tsx`
- [x] Remove "Due Today", "Overdue", "Upcoming (7d)" tabs
- [x] Remove "View All New Dues" and "View All Follow-Up Dues" buttons
- [x] Remove the "All caught up!" follow-up reminder UI
- [x] Remove the `FollowUpSection` import from `DashboardPage.tsx`
- [x] Do NOT leave empty space or placeholder — remove the component and close the gap

### Files to Modify
- [x] `src/pages/DashboardPage.tsx` — Remove `<FollowUpSection>` usage and import

### All follow-up functionality moves to:
- [ ] `Dues & Tasks` page (the new central hub)

---

## 2. NEW LEADS — ONLY NEVER-CONTACTED PEOPLE

### Strict Definition
"New Leads" = contacts who have **NEVER** received a cold email from the user.

### Rules
- [x] `emailSentCount === 0` (no email_logs with `email_type: 'initial'` for that contact)
- [x] `last_sent_at === null` (never sent any email)
- [x] They must disappear from New Leads immediately after the first email is successfully sent
- [x] Do NOT show previously contacted people in New Leads, even if:
  - They never replied
  - Their previous email is overdue
  - They are eligible for a follow-up

### Filter Logic (new)
```typescript
const newLeads = contacts.filter((c) => {
  if (c.do_not_email) return false;
  if (c.status === 'Replied') return false;
  // Only show contacts who have NEVER received an email
  return c.last_sent_at === null && c.status === 'New';
});
```

### Verification
- [x] Sarah Jenkins (no email sent) → appears in New Leads
- [x] After sending first email to Sarah → immediately disappears from New Leads
- [x] Previously contacted people never appear in New Leads

---

## 3. FOLLOW-UPS DUE — CENTRALIZED WORKFLOW

### Structure
Replace the current single "Follow-Ups Due" tab with a **dropdown-based workflow**.

### Dropdown Options
- [x] Follow-Up 1 (3 days)
- [x] Follow-Up 2 (7 days)
- [x] Follow-Up 3 (10 days)
- [x] Never Replied (after 12-day cutoff)

### UI Requirements
- [x] Dropdown selector above the contact table
- [x] Changing dropdown immediately updates the table
- [x] Filtering uses actual backend/data state, not visual hide
- [x] Each stage shows only contacts eligible for that specific follow-up

---

## 4. FOLLOW-UP 1 — 3 DAYS

### Eligibility Rules
- [x] Contact has received their first cold email (`email_type: 'initial'`)
- [x] Contact has NOT replied (`reply_count === 0` OR `status !== 'Replied'`)
- [x] 3 days have passed since the initial email was sent
- [x] No follow_up_1 email has been sent yet

### Filter Logic
```typescript
const followUp1 = contacts.filter((c) => {
  if (c.do_not_email || c.status === 'Replied') return false;
  const initialLog = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'initial');
  if (!initialLog) return false;
  const daysSinceInitial = differenceInDays(now, new Date(initialLog.sent_at));
  const followUp1Log = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'follow_up_1');
  return daysSinceInitial >= 3 && !followUp1Log;
});
```

### Example
- Initial email sent: September 8
- Today: September 11
- 3 days have passed → Contact appears in Follow-Up 1

### After Sending Follow-Up 1
- [x] Record the follow-up stage and date/time
- [x] Contact disappears from Follow-Up 1
- [x] Contact becomes eligible for Follow-Up 2 (7-day rule)

---

## 5. FOLLOW-UP 2 — 7 DAYS

### Eligibility Rules
- [x] Contact received initial email
- [x] Follow-Up 1 has been sent (`email_type: 'follow_up_1'` exists)
- [x] Contact has NOT replied
- [x] 7 days have passed since the initial email was sent (or since Follow-Up 1 was sent, depending on schedule)

### Filter Logic
```typescript
const followUp2 = contacts.filter((c) => {
  if (c.do_not_email || c.status === 'Replied') return false;
  const initialLog = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'initial');
  const followUp1Log = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'follow_up_1');
  if (!initialLog || !followUp1Log) return false;
  const daysSinceInitial = differenceInDays(now, new Date(initialLog.sent_at));
  const followUp2Log = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'follow_up_2');
  return daysSinceInitial >= 7 && !followUp2Log;
});
```

### Example
- Initial email → September 4
- Follow-Up 1 → September 7
- No reply
- Today: September 11 → 7 days since initial → Contact appears in Follow-Up 2

### After Sending Follow-Up 2
- [x] Record the follow-up stage and date/time
- [x] Contact disappears from Follow-Up 2
- [x] Contact becomes eligible for Follow-Up 3 (10-day rule)

---

## 6. FOLLOW-UP 3 — 10 DAYS

### Eligibility Rules
- [x] Contact received initial email
- [x] Follow-Up 1 has been sent
- [x] Follow-Up 2 has been sent (`email_type: 'follow_up_2'` exists)
- [x] Contact has NOT replied
- [x] 10 days have passed since the initial email was sent

### Filter Logic
```typescript
const followUp3 = contacts.filter((c) => {
  if (c.do_not_email || c.status === 'Replied') return false;
  const initialLog = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'initial');
  const followUp1Log = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'follow_up_1');
  const followUp2Log = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'follow_up_2');
  if (!initialLog || !followUp1Log || !followUp2Log) return false;
  const daysSinceInitial = differenceInDays(now, new Date(initialLog.sent_at));
  const followUp3Log = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'follow_up_3');
  return daysSinceInitial >= 10 && !followUp3Log;
});
```

### After Sending Follow-Up 3
- [x] Record the follow-up stage and date/time
- [x] Contact remains in follow-up lifecycle until final cutoff (12 days)
- [x] Do NOT show them as an active follow-up again once final follow-up is completed

---

## 7. NEVER REPLIED

### Eligibility Rules
- [x] Contact has no reply after 12 days from the initial outreach lifecycle
- [x] All follow-up stages (1, 2, 3) have been exhausted OR the 12-day cutoff has passed
- [x] Contact is no longer eligible for any automated follow-up

### Filter Logic
```typescript
const neverReplied = contacts.filter((c) => {
  if (c.do_not_email || c.status === 'Replied') return false;
  const initialLog = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'initial');
  if (!initialLog) return false;
  const daysSinceInitial = differenceInDays(now, new Date(initialLog.sent_at));
  const followUp3Log = emailLogs.find(l => l.contact_id === c.id && l.email_type === 'follow_up_3');
  return daysSinceInitial >= 12 || followUp3Log; // After 12-day cutoff OR after final follow-up sent
});
```

### Rules
- [x] They no longer appear in Follow-Up 1, 2, or 3
- [x] They no longer appear in New Leads
- [x] They only appear in Never Replied
- [x] This happens automatically based on dates/status, not manually

---

## 8. REPLY OVERRIDES FOLLOW-UP STATUS

### Rule
If a contact replies at **ANY** point, immediately:
- [x] Remove them from New Leads
- [x] Remove them from Follow-Up 1
- [x] Remove them from Follow-Up 2
- [x] Remove them from Follow-Up 3
- [x] Remove them from Never Replied
- [x] Set their status to `Replied`
- [x] Clear `follow_up_due_at`
- [x] Stop all automated follow-ups

### Verification
- [x] Contact replies → immediately disappears from all follow-up queues
- [x] A replied contact never becomes eligible for another automated follow-up

---

## 9. DATA / STATE LOGIC REQUIREMENTS

### The system must track:
- [x] Has an initial email ever been sent?
- [x] When was the initial email sent?
- [x] Has Follow-Up 1 been sent?
- [x] When was Follow-Up 1 sent?
- [x] Has Follow-Up 2 been sent?
- [x] When was Follow-Up 2 sent?
- [x] Has Follow-Up 3 been sent?
- [x] When was Follow-Up 3 sent?
- [x] Has the contact replied?
- [x] When was the latest reply received?
- [x] What is the current follow-up stage?
- [x] Has the contact crossed the 12-day cutoff?

### Requirements
- [x] UI must be derived from this state
- [x] Do not create duplicate contacts because of follow-up stages
- [x] Use actual email history (`email_logs`), not just a single `status` field

### Data Sources
- [x] `Contact` model: `status`, `last_sent_at`, `reply_count`, `last_replied_at`, `follow_up_due_at`
- [x] `EmailLog` model: `email_type` (initial, follow_up_1, follow_up_2, follow_up_3), `sent_at`

---

## 10. DUES & TASKS UI STRUCTURE

### Keep
- [x] Existing design and styling (dark theme, emerald accents)
- [x] Same table style: Checkbox, HR Name, Company, Email, Status, Replies, Last Sent, Follow-Up Due, Actions
- [x] Same Card, Badge, Button, Tabs components

### Change
- [x] Replace "New Leads" + "Follow-Ups Due" tabs with:
  - **New Leads** tab (only never-contacted)
  - **Follow-Ups Due** tab with dropdown selector

### Layout
```
Dues & Tasks
├── New Leads (tab)
│   └── ContactTable — only never-contacted people
└── Follow-Ups Due (tab)
    ├── Dropdown: [Follow-Up 1 ▼]
    │   ├── Follow-Up 1
    │   ├── Follow-Up 2
    │   ├── Follow-Up 3
    │   └── Never Replied
    └── ContactTable — filtered by selected stage
```

---

## 11. DROPDOWN BEHAVIOR

### Requirements
- [x] Dropdown behaves like a real filter
- [x] Changing the dropdown immediately updates the table
- [x] Do not load all contacts and simply hide them visually
- [x] Filtering must use the actual backend/data state
- [x] Dropdown shows the current stage name + count
- [x] Default selection: Follow-Up 1

### URL Sync
- [x] URL parameter: `?stage=followup_1|followup_2|followup_3|never_replied`
- [x] Deep linking works for each stage
- [x] Invalid stage defaults to `followup_1`

---

## 12. EXISTING EMAIL ACTIONS

### Preserve All Existing Actions
- [x] View contact
- [x] Send email
- [x] Reply-related actions
- [x] Follow-up actions
- [x] Delete
- [x] Other existing row actions

### Stage-Appropriate Actions

| Stage | Action |
|-------|--------|
| New Lead | Send Initial Cold Email |
| Follow-Up 1 | Send Follow-Up 1 |
| Follow-Up 2 | Send Follow-Up 2 |
| Follow-Up 3 | Send Final Follow-Up |
| Never Replied | No normal follow-up action |

### Action Navigation
- [x] New Lead → `/send?contactId=...`
- [x] Follow-Up 1 → `/send?contactId=...&templateType=follow_up_1`
- [x] Follow-Up 2 → `/send?contactId=...&templateType=follow_up_2`
- [x] Follow-Up 3 → `/send?contactId=...&templateType=follow_up_3`
- [x] Never Replied → No send action (or explicit override if needed)

---

## 13. DO NOT BREAK EXISTING FUNCTIONALITY

### Must Preserve
- [x] Contact import
- [x] Contact management
- [x] Email sending
- [x] Templates
- [x] Analytics
- [x] Reply tracking
- [x] Existing authentication
- [x] Existing database structure (unless schema change is genuinely required)
- [x] Existing dashboard functionality outside Follow-Up Reminders section
- [x] All other pages and components

### Reuse
- [x] Current architecture and components wherever possible
- [x] `ContactTable` component (with checkboxes)
- [x] `useContacts` hook
- [x] `useEmailLogs` hook
- [x] Existing routing structure

---

## 14. EDGE CASES

### Handle These Correctly

- [x] **A.** Contact has never been emailed → New Leads
- [x] **B.** Initial email sent less than 3 days ago and no reply → Not yet due for Follow-Up 1
- [x] **C.** 3 days reached and no reply → Follow-Up 1
- [x] **D.** Follow-Up 1 sent and contact has not replied → Eventually Follow-Up 2 (7-day rule)
- [x] **E.** Follow-Up 2 sent and no reply → Eventually Follow-Up 3 (10-day rule)
- [x] **F.** No reply after final cutoff / 12-day rule → Never Replied
- [x] **G.** Contact replies at any point → Replied, removed from all follow-up queues
- [x] **H.** User sends a follow-up manually → Update the correct follow-up stage and timestamps

---

## 15. DATE CALCULATION

### Requirements
- [x] Use real timestamps/dates from email records
- [x] Do not hardcode dates
- [x] Make calculations timezone-safe
- [x] Avoid off-by-one errors
- [x] Clearly define eligibility calculation in code for easy maintenance

### Functions to Create
- [x] `getInitialEmailDate(contactId)` → Date | null
- [x] `getFollowUp1Date(contactId)` → Date | null
- [x] `getFollowUp2Date(contactId)` → Date | null
- [x] `getFollowUp3Date(contactId)` → Date | null
- [x] `getDaysSinceInitial(contactId)` → number
- [x] `getFollowUpStage(contactId)` → 'new' | 'followup_1' | 'followup_2' | 'followup_3' | 'never_replied' | 'replied'
- [x] `isEligibleForFollowUp(contactId, stage)` → boolean

---

## 16. FINAL EXPECTED USER EXPERIENCE

```
New Lead
↓
Send Initial Email
↓
3 days + no reply
↓
Follow-Up 1
↓
7-day eligibility + no reply
↓
Follow-Up 2
↓
10-day eligibility + no reply
↓
Follow-Up 3
↓
After 12-day cutoff + no reply
↓
Never Replied

At ANY stage:
Reply received → Replied → Stop all follow-ups
```

---

## 17. IMPLEMENTATION REQUIREMENTS

### Before Making Changes
- [x] Inspect existing DuesPage.tsx component/page
- [x] Find current contact/status/email-history logic
- [x] Find how sent emails and replies are stored
- [x] Find the current follow-up reminder implementation
- [x] Reuse existing models/services/API functions where possible
- [x] Then implement the new workflow cleanly

### Do Not
- [x] Create a parallel follow-up system if one already exists
- [x] Redesign the entire application visually
- [x] Change the dark theme or design system

### After Implementation — Verify
- [x] New Leads only shows never-contacted contacts
- [x] Follow-Up 1 timing is correct (3 days)
- [x] Follow-Up 2 timing is correct (7 days)
- [x] Follow-Up 3 timing is correct (10 days)
- [x] Never Replied transition happens correctly (12 days)
- [x] Replied contacts leave every follow-up queue
- [x] Sending an email updates the correct stage
- [x] Old Dashboard Follow-Up Reminders section is completely removed
- [x] No duplicate contacts between sections

---

## 📁 FILES TO MODIFY

| File | Change |
|------|--------|
| `src/pages/DuesPage.tsx` | [x] Replace tab logic with new filtering, add dropdown, update actions |
| `src/pages/DashboardPage.tsx` | [x] Remove `<FollowUpSection>` component and import |
| `src/components/dashboard/FollowUpSection.tsx` | [ ] Delete or archive (no longer used) |
| `src/hooks/useContacts.ts` | [x] Add helper functions for follow-up stage calculation |
| `src/types/index.ts` | [x] Added `follow_up_3` to email_type union |

---

## 📊 SEED DATA REQUIREMENTS

Update seed contacts to demonstrate all stages:
- [x] New Lead (never emailed)
- [x] Follow-Up 1 eligible (3+ days, initial email sent)
- [x] Follow-Up 2 eligible (7+ days, follow-up 1 sent)
- [x] Follow-Up 3 eligible (10+ days, follow-up 2 sent)
- [x] Never Replied (12+ days, all follow-ups exhausted)
- [x] Replied (at any stage)
- [x] Do Not Email (blocked)

---

*This file tracks all work related to the Dues & Tasks redesign. Update checkboxes as work progresses.*
