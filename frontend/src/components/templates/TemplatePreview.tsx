// FILE: src/components/templates/TemplatePreview.tsx
import React from 'react';
import { composeMail } from '../../lib/emailComposer';
import { UserSettings } from '../../types';

export interface TemplatePreviewProps {
  subject: string;
  body: string;
  settings: Partial<UserSettings>;
  customContact?: {
    hr_name: string;
    company_name: string;
    job_role: string;
    email: string;
  };
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  subject,
  body,
  settings,
  customContact = {
    hr_name: 'Sarah',
    company_name: 'Google',
    job_role: 'Software Engineer',
    email: 'sarah.recruiter@google.com',
  },
}) => {
  const composed = composeMail(
    { subject, body },
    customContact,
    settings
  );

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-xl overflow-hidden shadow-xs text-xs">
      {/* Email Client Header Chrome */}
      <div className="bg-[#0a0a0a] border-b border-white/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-500 w-12 text-right uppercase text-[10px] tracking-wider">
            From:
          </span>
          <span className="text-zinc-200 font-medium">
            {settings.sender_name || 'Sanju Designer'}{' '}
            <span className="text-zinc-500">
              &lt;{settings.sender_email || 'sanju.designer001@gmail.com'}&gt;
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-500 w-12 text-right uppercase text-[10px] tracking-wider">
            To:
          </span>
          <span className="text-zinc-200">
            {customContact.hr_name} &lt;{customContact.email}&gt;
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <span className="font-mono text-zinc-500 w-12 text-right uppercase text-[10px] tracking-wider">
            Subject:
          </span>
          <span className="font-semibold text-white text-sm tracking-tight">{composed.subject}</span>
        </div>
      </div>

      {/* Email Body Content */}
      <div className="p-6 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans min-h-[220px] bg-[#0c0c0c]">
        {composed.plainTextBody}
      </div>

      {/* Subtle preview disclaimer */}
      <div className="bg-[#0a0a0a] border-t border-white/5 px-4 py-2 text-[11px] text-zinc-500 font-mono flex justify-between items-center">
        <span>Sample preview for: {customContact.hr_name} ({customContact.company_name})</span>
        <span className="text-emerald-400 font-medium">● Merge tags matched</span>
      </div>
    </div>
  );
};
