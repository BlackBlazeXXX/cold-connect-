// FILE: src/components/send/ResumeAttachBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserSettings } from '../../types';

export interface ResumeAttachBarProps {
  settings: Partial<UserSettings>;
}

export const ResumeAttachBar: React.FC<ResumeAttachBarProps> = ({ settings }) => {
  const hasResume = Boolean(settings.google_drive_resume_link);

  return (
    <div
      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-colors ${
        hasResume
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-amber-500/5 border-amber-500/20'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            hasResume ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
          }`}
        >
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <div className="font-medium text-white flex items-center gap-1.5">
            <span>Resume Attachment Link</span>
            {hasResume ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                <CheckCircle2 className="w-3 h-3" /> Linked
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded">
                <AlertCircle className="w-3 h-3" /> Missing
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {hasResume
              ? 'Automatically inserted wherever {Resume_Link} is placed in your template.'
              : 'Add your view-only Google Drive resume link to avoid spam filters.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasResume ? (
          <a
            href={settings.google_drive_resume_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono font-medium text-emerald-400 hover:underline text-xs"
          >
            <span>View Resume</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <Link
            to="/settings"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 font-mono font-medium text-xs transition-colors"
          >
            Configure in Settings
          </Link>
        )}
      </div>
    </div>
  );
};
