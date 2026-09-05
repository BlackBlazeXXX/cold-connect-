// FILE: src/constants/constants.ts

export const APP_CONFIG = {
  name: "Cold Connect",
  tagline: "Smart cold outreach for job seekers",
  version: "1.0.0",
  dailySendLimit: 100,
  dailySendWarning: 80,
  followUpDays: 3,
  maxTemplates: 10,
  maxTemplateVersions: 5,
};

export const EMAIL_PLACEHOLDERS = [
  { key: "{HR_Name}", description: "HR person's first name" },
  { key: "{Company_Name}", description: "Company name" },
  { key: "{Job_Role}", description: "Role you're applying for" },
  { key: "{Your_Name}", description: "Your full name" },
  { key: "{Resume_Link}", description: "Auto-inserted Drive link" },
];

export const CONTACT_STATUSES = [
  "New",
  "Email Sent",
  "Follow-Up 1 Sent",
  "Follow-Up 2 Sent",
  "Replied",
  "Do Not Email",
  "Rejected",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  "New": "#94A3B8",
  "Email Sent": "#3B82F6",
  "Follow-Up 1 Sent": "#F59E0B",
  "Follow-Up 2 Sent": "#F97316",
  "Replied": "#22C55E",
  "Do Not Email": "#EF4444",
  "Rejected": "#6B7280",
};

export const SEND_TIME_OPTIONS = [
  { label: "8:00 AM  — Early morning", value: "08:00" },
  { label: "9:00 AM  — Professional", value: "09:00" },
  { label: "10:00 AM — Peak attention", value: "10:00" },
  { label: "11:00 AM — Pre-lunch", value: "11:00" },
  { label: "2:00 PM  — Post-lunch", value: "14:00" },
  { label: "3:00 PM  — Afternoon", value: "15:00" },
];

export const NAV_LINKS = [
  { label: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
  { label: "Upload", path: "/upload", icon: "Upload" },
  { label: "Contacts", path: "/contacts", icon: "Users" },
  { label: "Templates", path: "/templates", icon: "FileText" },
  { label: "Send Email", path: "/send", icon: "Send" },
  { label: "Analytics", path: "/analytics", icon: "BarChart2" },
  { label: "Settings", path: "/settings", icon: "Settings" },
];

export const AI_PROMPTS = {
  subjectLine: (subject: string, hrName: string, company: string) =>
    `You are an expert cold email copywriter.
Original subject line: "${subject}"
HR Name: ${hrName}, Company: ${company}

Suggest ONE improved subject line that:
- Is personalized to the company/person
- Creates curiosity without being clickbait
- Is under 50 characters
- Avoids spam trigger words
- Feels human and professional

Return ONLY the subject line text. Nothing else.`,

  emailFeedback: (emailBody: string) =>
    `You are an expert cold email coach.
Review this cold email body:

"${emailBody}"

Return a JSON object with this exact structure:
{
  "score": 75,
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific issue 1", "specific issue 2"],
  "rewriteSuggestion": "optional rewrite of weak sentence"
}

Be specific. No generic advice.
Return ONLY the JSON. Nothing else.`,
};

export const CSV_COLUMN_MAPPINGS = {
  name: [
    "name",
    "hr name",
    "contact name",
    "first name",
    "person",
    "full name",
    "hr_name",
  ],
  company: [
    "company",
    "company name",
    "organization",
    "employer",
    "firm",
    "company_name",
  ],
  email: [
    "email",
    "email address",
    "e-mail",
    "mail",
    "contact email",
    "email_address",
  ],
  role: [
    "role",
    "job role",
    "position",
    "job title",
    "designation",
    "title",
  ],
};

export const PDF_EXTRACTION_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  company: /(?:Company|Organization|Employer|Firm):\s*(.+)/gi,
  name: /(?:Name|Contact|HR|Recruiter):\s*(.+)/gi,
};

export const STORAGE_KEYS = {
  draftTemplate: "cc_draft_template",
  uploadSession: "cc_upload_session",
  sendQueue: "cc_send_queue",
  authFallbackUser: "cc_fallback_user",
  contactsFallback: "cc_contacts_db",
  templatesFallback: "cc_templates_db",
  templateVersionsFallback: "cc_template_versions_db",
  emailLogsFallback: "cc_email_logs_db",
  settingsFallback: "cc_settings_db",
  dailyLimitsFallback: "cc_daily_limits_db",
  uploadBatchesFallback: "cc_upload_batches_db",
};
