// FILE: src/components/settings/ResumeConfig.tsx
import React from 'react';
import { FileText, ExternalLink, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export interface ResumeConfigProps {
  resumeLink: string;
  onChange: (link: string) => void;
}

export const ResumeConfig: React.FC<ResumeConfigProps> = ({ resumeLink, onChange }) => {
  const handleVerify = () => {
    if (resumeLink) {
      window.open(resumeLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Google Drive Resume Link</h4>
          <p className="text-xs text-zinc-500">
            Link your hosted PDF resume instead of attaching heavy files that trigger spam filters.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Input
          label="Shareable Document Link"
          type="url"
          value={resumeLink || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
          helperText="Important: Ensure Google Drive sharing is set to 'Anyone with the link can view'."
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="text-xs text-zinc-500">
            In emails: <code className="text-emerald-400 font-mono">{'{Resume_Link}'}</code> will be
            replaced with this URL.
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={!resumeLink}
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            onClick={handleVerify}
          >
            Verify Link Permissions
          </Button>
        </div>

        {resumeLink && (
          <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-xs space-y-1">
            <span className="font-medium text-white">Email appearance preview:</span>
            <p className="text-zinc-400">
              You can review my updated portfolio and resume here:{' '}
              <a
                href={resumeLink}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 underline break-all"
              >
                {resumeLink}
              </a>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
