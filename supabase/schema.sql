-- FILE: supabase/schema.sql
-- Cold Connect Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users NOT NULL,
  hr_name          TEXT NOT NULL,
  company_name     TEXT NOT NULL,
  email            TEXT NOT NULL,
  job_role         TEXT DEFAULT '',
  status           TEXT DEFAULT 'New',
  reply_count      INTEGER DEFAULT 0,
  last_sent_at     TIMESTAMPTZ,
  last_replied_at  TIMESTAMPTZ,
  follow_up_due_at TIMESTAMPTZ,
  notes            TEXT DEFAULT '',
  do_not_email     BOOLEAN DEFAULT false,
  source           TEXT DEFAULT 'manual',
  upload_batch_id  UUID,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- 2. Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  name        TEXT NOT NULL,
  subject     TEXT NOT NULL,
  body        TEXT NOT NULL,
  is_default  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Template Versions
CREATE TABLE IF NOT EXISTS template_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   UUID REFERENCES email_templates ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users NOT NULL,
  subject       TEXT NOT NULL,
  body          TEXT NOT NULL,
  version_note  TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users NOT NULL,
  contact_id   UUID REFERENCES contacts ON DELETE SET NULL,
  template_id  UUID REFERENCES email_templates ON DELETE SET NULL,
  subject_used TEXT NOT NULL,
  body_used    TEXT NOT NULL,
  sent_at      TIMESTAMPTZ DEFAULT NOW(),
  email_type   TEXT DEFAULT 'initial',
  resend_id    TEXT,
  status       TEXT DEFAULT 'pending'
);

-- 5. Daily Send Limits
CREATE TABLE IF NOT EXISTS daily_send_limits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  sent_count  INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- 6. Upload Batches
CREATE TABLE IF NOT EXISTS upload_batches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  total_rows  INTEGER DEFAULT 0,
  imported    INTEGER DEFAULT 0,
  skipped     INTEGER DEFAULT 0,
  duplicates  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users UNIQUE NOT NULL,
  full_name           TEXT DEFAULT '',
  resume_drive_link   TEXT DEFAULT '',
  resend_api_key      TEXT DEFAULT '',
  anthropic_api_key   TEXT DEFAULT '',
  sender_name         TEXT DEFAULT '',
  sender_email        TEXT DEFAULT '',
  preferred_send_time TEXT DEFAULT '09:00',
  daily_limit         INTEGER DEFAULT 100,
  follow_up_days      INTEGER DEFAULT 3,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_send_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own contacts" ON contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own templates" ON email_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON email_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON email_templates FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own template_versions" ON template_versions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own template_versions" ON template_versions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own email_logs" ON email_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email_logs" ON email_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own email_logs" ON email_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily limits" ON daily_send_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own daily limits" ON daily_send_limits FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own upload batches" ON upload_batches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own upload batches" ON upload_batches FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view and edit own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Auto Trigger on Email Log insert
CREATE OR REPLACE FUNCTION on_email_logged()
RETURNS TRIGGER AS $$
DECLARE
  v_follow_up_days INTEGER := 3;
BEGIN
  -- Get user follow_up_days
  SELECT COALESCE(follow_up_days, 3) INTO v_follow_up_days
  FROM user_settings WHERE user_id = NEW.user_id;

  -- 1. Update contact
  UPDATE contacts
  SET last_sent_at = NEW.sent_at,
      follow_up_due_at = NEW.sent_at + (v_follow_up_days || ' days')::INTERVAL,
      status = CASE
        WHEN NEW.email_type = 'initial' THEN 'Email Sent'
        WHEN NEW.email_type = 'follow_up_1' THEN 'Follow-Up 1 Sent'
        WHEN NEW.email_type = 'follow_up_2' THEN 'Follow-Up 2 Sent'
        ELSE status
      END
  WHERE id = NEW.contact_id;

  -- 2. Upsert daily limit
  INSERT INTO daily_send_limits (user_id, date, sent_count)
  VALUES (NEW.user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET sent_count = daily_send_limits.sent_count + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_logged ON email_logs;
CREATE TRIGGER trg_email_logged
AFTER INSERT ON email_logs
FOR EACH ROW EXECUTE FUNCTION on_email_logged();
