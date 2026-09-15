// FILE: src/components/templates/VersionHistory.tsx
import React, { useState } from 'react';
import { History, RotateCcw, Eye, ChevronRight } from 'lucide-react';
import { TemplateVersion } from '../../types';
import { Button } from '../ui/Button';
import { format } from 'date-fns';

export interface VersionHistoryProps {
  versions: TemplateVersion[];
  onRestoreVersion: (version: TemplateVersion) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  onRestoreVersion,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);

  if (versions.length === 0) {
    return (
      <div className="text-center py-10 text-xs text-[#64748B]">
        <History className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
        No past versions recorded yet. Updates you save will appear here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Versions List */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          Saved Revisions ({versions.length})
        </h4>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {versions.map((ver, idx) => {
            const isSelected = selectedVersion?.id === ver.id;
            return (
              <div
                key={ver.id}
                onClick={() => setSelectedVersion(ver)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-500/50 bg-white/5 shadow-xs'
                    : 'border-white/5 bg-[#0a0a0a] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">
                    Version {ver.version_number ?? (versions.length - idx)}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {format(new Date(ver.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-1">
                  {ver.subject || 'No subject'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Version Details & Restore Action */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 flex flex-col justify-between text-xs">
        {selectedVersion ? (
          <div className="space-y-3">
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-500">Subject</span>
              <div className="font-medium text-white mt-0.5">{selectedVersion.subject}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-500">Email Body</span>
              <div className="p-3 bg-[#080808] border border-white/5 rounded-lg font-mono text-[11px] text-zinc-300 whitespace-pre-wrap max-h-48 overflow-y-auto mt-0.5">
                {selectedVersion.body}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-emerald-400" />}
              onClick={() => onRestoreVersion(selectedVersion)}
              className="w-full mt-2"
            >
              Restore Version {selectedVersion.version_number ?? ''}
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-600 font-mono">
            <Eye className="w-6 h-6 mx-auto mb-2 opacity-60" />
            Select a revision on the left to preview its content and restore.
          </div>
        )}
      </div>
    </div>
  );
};
