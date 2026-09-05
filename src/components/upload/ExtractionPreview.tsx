// FILE: src/components/upload/ExtractionPreview.tsx
import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Copy, Info } from 'lucide-react';
import { Card } from '../ui/Card';

export interface ExtractionPreviewProps {
  totalRows: number;
  validCount: number;
  warningCount: number;
  invalidCount: number;
  duplicateCount: number;
  warnings?: string[];
}

export const ExtractionPreview: React.FC<ExtractionPreviewProps> = ({
  totalRows,
  validCount,
  warningCount,
  invalidCount,
  duplicateCount,
  warnings = [],
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 flex items-center gap-3 border-emerald-500/20 bg-emerald-500/5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-mono font-bold text-white">{validCount}</div>
            <div className="text-[11px] font-mono text-emerald-400">Valid Contacts</div>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3 border-amber-500/20 bg-amber-500/5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-mono font-bold text-white">{warningCount}</div>
            <div className="text-[11px] font-mono text-amber-400">Warnings / Minor</div>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3 border-amber-500/20 bg-amber-500/5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Copy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-mono font-bold text-white">{duplicateCount}</div>
            <div className="text-[11px] font-mono text-amber-400">Duplicates</div>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3 border-rose-500/20 bg-rose-500/5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-mono font-bold text-white">{invalidCount}</div>
            <div className="text-[11px] font-mono text-rose-400">Invalid Format</div>
          </div>
        </Card>
      </div>

      {warnings.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-400 font-mono">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {warnings.map((w, idx) => (
              <p key={idx}>{w}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
