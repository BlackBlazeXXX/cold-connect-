// FILE: src/components/upload/UploadZone.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, FileSpreadsheet, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
  selectedFile: File | null;
  onClearFile?: () => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  isLoading = false,
  selectedFile,
  onClearFile,
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.file.size > MAX_FILE_SIZE_BYTES) {
          setError('File too large. Maximum allowed size is 10MB.');
        } else {
          setError('Only CSV or PDF files accepted.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'csv' && ext !== 'pdf') {
          setError('Only CSV or PDF files accepted.');
          return;
        }
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE_BYTES,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    disabled: isLoading,
  } as any);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
          isDragActive
            ? 'border-emerald-500 bg-emerald-500/10'
            : selectedFile
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-white/10 bg-[#0a0a0a] hover:border-white/20 hover:bg-white/[0.02]'
        }`}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-xs mb-3">
              {selectedFile.name.endsWith('.pdf') ? (
                <FileText className="w-7 h-7" />
              ) : (
                <FileSpreadsheet className="w-7 h-7" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{selectedFile.name}</span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              {formatFileSize(selectedFile.size)} • Click or drop another to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-emerald-400 flex items-center justify-center shadow-xs mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-white">
              {isDragActive ? 'Drop your file here...' : 'Click to browse or drag & drop contact list'}
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Supports <strong className="text-zinc-200">.csv</strong> or <strong className="text-zinc-200">.pdf</strong> up to 10MB with recruiter contact details.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
