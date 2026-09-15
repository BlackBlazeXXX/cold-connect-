// FILE: src/components/contacts/NotesField.tsx
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

export interface NotesFieldProps {
  initialNotes: string;
  onSave: (notes: string) => void;
  placeholder?: string;
}

export const NotesField: React.FC<NotesFieldProps> = ({
  initialNotes = '',
  onSave,
  placeholder = 'Add context — referred by X, interested in Y, interview notes...',
}) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNotes(initialNotes || '');
  }, [initialNotes]);

  const handleBlur = () => {
    if (notes !== (initialNotes || '')) {
      onSave(notes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <label className="font-medium text-white">Context & Notes</label>
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
              <Check className="w-3 h-3" /> Auto-saved
            </span>
          )}
          <span className="text-[11px] text-zinc-500 font-mono">{(notes || '').length} chars</span>
        </div>
      </div>

      <textarea
        value={notes || ''}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={4}
        className="w-full bg-[#0a0a0a] border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none transition-all resize-y"
      />
    </div>
  );
};
