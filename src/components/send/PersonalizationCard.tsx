// FILE: src/components/send/PersonalizationCard.tsx
import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { generateSubjectSuggestions } from '../../lib/anthropic';

export interface PersonalizationCardProps {
  hrName: string;
  companyName: string;
  jobRole: string;
  subject: string;
  senderName: string;
  onChangeHrName: (val: string) => void;
  onChangeCompany: (val: string) => void;
  onChangeJobRole: (val: string) => void;
  onChangeSubject: (val: string) => void;
  anthropicApiKey?: string;
}

export const PersonalizationCard: React.FC<PersonalizationCardProps> = ({
  hrName,
  companyName,
  jobRole,
  subject,
  senderName,
  onChangeHrName,
  onChangeCompany,
  onChangeJobRole,
  onChangeSubject,
  anthropicApiKey,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleGenerateAiSubjects = async () => {
    setIsGenerating(true);
    try {
      const suggestions = await generateSubjectSuggestions(
        jobRole || 'Engineer / Designer',
        companyName || 'Target Company',
        senderName || 'Candidate',
        anthropicApiKey
      );
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to generate AI subjects:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Personalization Details</h4>
          <p className="text-xs text-zinc-500">
            Adjust variables before dispatching to ensure personalized tags match.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="HR / Recruiter Name"
          value={hrName || ''}
          onChange={(e) => onChangeHrName(e.target.value)}
          placeholder="e.g. Sarah"
        />
        <Input
          label="Company Name"
          value={companyName || ''}
          onChange={(e) => onChangeCompany(e.target.value)}
          placeholder="e.g. Google"
        />
        <Input
          label="Job Role"
          value={jobRole || ''}
          onChange={(e) => onChangeJobRole(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
        />
      </div>

      {/* Subject Line & AI Suggestions */}
      <div className="pt-2 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-white">Email Subject</label>
          <button
            type="button"
            onClick={handleGenerateAiSubjects}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generating...' : 'Generate 3 AI Subject Lines'}</span>
          </button>
        </div>

        <input
          type="text"
          value={subject || ''}
          onChange={(e) => onChangeSubject(e.target.value)}
          placeholder="e.g. Quick question regarding {Job_Role} at {Company_Name}"
          className="w-full bg-[#0a0a0a] border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
        />

        {aiSuggestions.length > 0 && (
          <div className="p-3 bg-[#0a0a0a] border border-emerald-500/20 rounded-xl space-y-1.5 animate-in fade-in">
            <div className="text-[11px] font-mono font-medium text-emerald-400">
              AI Generated Options (Click to use):
            </div>
            {aiSuggestions.map((s, idx) => (
              <div
                key={idx}
                onClick={() => onChangeSubject(s)}
                className="p-2 bg-[#0c0c0c] hover:bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-200 flex items-center justify-between cursor-pointer transition-colors group"
              >
                <span>{s}</span>
                <span className="text-[11px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  Use This <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
