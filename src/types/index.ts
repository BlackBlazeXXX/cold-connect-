// FILE: src/types/index.ts

export type ContactStatus =
  | "New"
  | "Email Sent"
  | "Follow-Up 1 Sent"
  | "Follow-Up 2 Sent"
  | "Replied"
  | "Do Not Email"
  | "Rejected";

export interface Contact {
  id: string;
  user_id: string;
  hr_name: string;
  company_name: string;
  email: string;
  job_role: string;
  status: ContactStatus;
  reply_count: number; // 0, 1, 2, 3+
  last_sent_at: string | null; // ISO timestamp
  last_replied_at: string | null;
  follow_up_due_at: string | null; // auto-calculated
  notes: string;
  do_not_email: boolean;
  created_at: string;
  source: "csv" | "pdf" | "manual";
  upload_batch_id: string | null;
}

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  type?: string;
  subject: string;
  body: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  user_id: string;
  subject: string;
  body: string;
  version_note: string;
  version_number?: number;
  created_at: string;
}

export interface EmailLog {
  id: string;
  user_id: string;
  contact_id: string;
  template_id: string | null;
  subject_used: string;
  body_used: string;
  sent_at: string;
  email_type: "initial" | "follow_up_1" | "follow_up_2";
  resend_id?: string | null;
  status: "sent" | "failed" | "pending";
  error_message?: string | null;
  recipient_email?: string;
}

export interface TemplateMetric {
  id: string;
  name: string;
  type: string;
  sent: number;
  replied: number;
  replyRate: number;
}

export interface CompanyMetric {
  company: string;
  contacts: number;
  sent: number;
  replied: number;
  replyRate: number;
}

export interface DailySendLimit {
  date: string; // "YYYY-MM-DD"
  user_id: string;
  sent_count: number;
}

export interface UserSettings {
  user_id: string;
  full_name: string;
  email: string;
  resume_drive_link: string;
  google_drive_resume_link?: string;
  resend_api_key: string;
  anthropic_api_key: string;
  sender_name: string;
  sender_email: string;
  reply_to_email?: string;
  preferred_send_time: string;
  daily_limit: number;
  daily_email_limit?: number;
  follow_up_days: number;
  default_follow_up_days?: number;
  default_follow_up_2_days?: number;
  created_at: string;
  updated_at: string;
}

export interface ExtractedContact {
  hr_name: string;
  company_name: string;
  email: string;
  job_role: string;
  is_valid: boolean;
  errors: string[];
  is_duplicate: boolean;
  existing_id: string | null;
}

export interface UploadBatch {
  id: string;
  user_id: string;
  file_name: string;
  file_type: "csv" | "pdf";
  total_rows: number;
  imported: number;
  skipped: number;
  duplicates: number;
  created_at: string;
}

export interface AnalyticsData {
  total_contacts: number;
  total_sent: number;
  total_replied: number;
  reply_rate: number;
  follow_ups_sent: number;
  do_not_email: number;
  sent_today: number;
  replied_today: number;
  weekly_sent: { date: string; sent: number; replied: number }[];
  top_companies: { company: string; count: number }[];
  status_breakdown: { status: string; count: number }[];
}

export interface DashboardData {
  new_to_send_today: number;
  follow_ups_due: Contact[];
  recent_replies: Contact[];
  sent_today: number;
  daily_limit: number;
  todays_queue: Contact[];
}

export interface AISubjectSuggestion {
  original: string;
  suggested: string;
  accepted: boolean | null;
}

export interface AIEmailFeedback {
  score: number;
  overall_score?: number;
  strengths: string[];
  improvements: string[];
  rewriteSuggestion?: string;
  improved_body?: string;
  subject_alternatives?: string[];
}

export interface SendJob {
  contact: Contact;
  template: EmailTemplate;
  subject: string;
  body: string;
  scheduled_for: string;
  status: "pending" | "sent" | "failed";
  error?: string;
}
