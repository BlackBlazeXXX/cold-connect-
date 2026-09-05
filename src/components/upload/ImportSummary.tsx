// FILE: src/components/upload/ImportSummary.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Copy, ArrowRight, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface ImportSummaryProps {
  importedCount: number;
  skippedCount: number;
  duplicateCount: number;
  batchId: string;
  onReset: () => void;
}

export const ImportSummary: React.FC<ImportSummaryProps> = ({
  importedCount,
  skippedCount,
  duplicateCount,
  batchId,
  onReset,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="max-w-xl mx-auto p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">Import Completed</h3>
        <p className="text-xs text-zinc-500 mt-1">
          Your new recruiter contacts have been saved and indexed for outreach.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 py-2">
        <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl text-center">
          <div className="text-2xl font-mono font-bold text-emerald-400">{importedCount}</div>
          <div className="text-[11px] font-mono text-zinc-500 mt-0.5">Imported</div>
        </div>

        <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl text-center">
          <div className="text-2xl font-mono font-bold text-amber-400">{skippedCount}</div>
          <div className="text-[11px] font-mono text-zinc-500 mt-0.5">Skipped / Invalid</div>
        </div>

        <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl text-center">
          <div className="text-2xl font-mono font-bold text-amber-400">{duplicateCount}</div>
          <div className="text-[11px] font-mono text-zinc-500 mt-0.5">Duplicates</div>
        </div>
      </div>

      <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-lg text-xs font-mono text-zinc-500 flex items-center justify-between">
        <span>Batch Reference:</span>
        <span className="font-semibold text-white">{batchId}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="secondary"
          className="flex-1"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={onReset}
        >
          Upload Another File
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          rightIcon={<ArrowRight className="w-4 h-4" />}
          onClick={() => navigate('/contacts')}
        >
          Go to Contacts
        </Button>
      </div>
    </Card>
  );
};
