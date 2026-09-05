// FILE: src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { ResendConfig } from '../components/settings/ResendConfig';
import { ResumeConfig } from '../components/settings/ResumeConfig';
import { DailyLimitConfig } from '../components/settings/DailyLimitConfig';
import { FollowUpIntervalConfig } from '../components/settings/FollowUpIntervalConfig';
import { AnthropicConfig } from '../components/settings/AnthropicConfig';
import { DataManagement } from '../components/settings/DataManagement';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isFirstRun = searchParams.get('firstRun') === 'true';

  const { settings, updateSettings, loading, isSetupComplete } = useSettings();
  const { user } = useAuth();
  const { contacts, resetContacts, loadSampleData } = useContacts();
  const { templates, resetTemplates } = useTemplates();

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveAll = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetAllData = () => {
    resetContacts();
    resetTemplates();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* First Run Onboarding Banner */}
      {isFirstRun && (
        <div className="p-5 bg-[#0c0c0c] border border-emerald-500/30 text-white rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white tracking-tight">Welcome to Cold Connect!</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Let's get your sender profile set up. Add your Sender Name and your view-only Google
            Drive resume link below. You can use our demo keys or plug in your real Resend & Claude
            credentials whenever you're ready!
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Account & Outreach Settings</h3>
          <p className="text-xs text-zinc-500">
            Configure email delivery credentials, hosted resume links, sending limits, and AI keys.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-mono animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Settings saved automatically</span>
          </div>
        )}
      </div>

      {/* SECTION 1: Resend Configuration */}
      <ResendConfig
        apiKey={settings.resend_api_key}
        senderName={settings.sender_name}
        senderEmail={settings.sender_email}
        replyToEmail={settings.reply_to_email}
        userEmail={user?.email || 'sanju.designer001@gmail.com'}
        onChange={(fields) => {
          updateSettings(fields);
          handleSaveAll();
        }}
      />

      {/* SECTION 2: Resume Link */}
      <ResumeConfig
        resumeLink={settings.google_drive_resume_link}
        onChange={(link) => {
          updateSettings({ google_drive_resume_link: link });
          handleSaveAll();
        }}
      />

      {/* SECTION 3: Daily Limit */}
      <DailyLimitConfig
        dailyLimit={settings.daily_email_limit}
        onChange={(limit) => {
          updateSettings({ daily_email_limit: limit });
          handleSaveAll();
        }}
      />

      {/* SECTION 4: Follow-Up Intervals */}
      <FollowUpIntervalConfig
        interval1={settings.default_follow_up_days}
        interval2={settings.default_follow_up_2_days}
        onChange={(fields) => {
          updateSettings(fields);
          handleSaveAll();
        }}
      />

      {/* SECTION 5: Anthropic Claude Config */}
      <AnthropicConfig
        apiKey={settings.anthropic_api_key}
        onChange={(key) => {
          updateSettings({ anthropic_api_key: key });
          handleSaveAll();
        }}
      />

      {/* SECTION 6: Data Management & Export */}
      <DataManagement
        contacts={contacts}
        templates={templates}
        onResetData={handleResetAllData}
        onLoadSampleData={loadSampleData}
      />
    </div>
  );
};
