// FILE: src/components/upload/FileTypeSelector.tsx
import React from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';

export interface FileTypeSelectorProps {
  selectedType: 'csv' | 'pdf';
  onSelectType: (type: 'csv' | 'pdf') => void;
  disabled?: boolean;
}

export const FileTypeSelector: React.FC<FileTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelectType('csv')}
        className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
          selectedType === 'csv'
            ? 'border-emerald-500/50 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/50'
            : 'border-white/5 bg-[#0c0c0c] hover:border-white/10 hover:bg-white/[0.02]'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            selectedType === 'csv'
              ? 'bg-emerald-500 text-black font-bold'
              : 'bg-[#0a0a0a] border border-white/5 text-zinc-400'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">CSV Spreadsheet</h4>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Standard format exported from LinkedIn, Apollo, or Google Sheets. Columns: Name, Email, Company, Role.
          </p>
        </div>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelectType('pdf')}
        className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
          selectedType === 'pdf'
            ? 'border-emerald-500/50 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/50'
            : 'border-white/5 bg-[#0c0c0c] hover:border-white/10 hover:bg-white/[0.02]'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            selectedType === 'pdf'
              ? 'bg-emerald-500 text-black font-bold'
              : 'bg-[#0a0a0a] border border-white/5 text-zinc-400'
          }`}
        >
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Structured PDF Document</h4>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            HR contact sheets or company recruiter rosters. Text extraction parses contact blocks and emails.
          </p>
        </div>
      </button>
    </div>
  );
};
