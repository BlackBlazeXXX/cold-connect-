// FILE: src/components/templates/AIFeedbackPanel.tsx
import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  X,
  Copy,
} from 'lucide-react';
import { AIEmailFeedback } from '../../types';
import { Button } from '../ui/Button';

export interface AIFeedbackPanelProps {
  feedback: AIEmailFeedback | null;
  onApplySubject: (subject: string) => void;
  onApplyBody: (body: string) => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export const AIFeedbackPanel: React.FC<AIFeedbackPanelProps> = ({
  feedback,
  onApplySubject,
  onApplyBody,
  onDismiss,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#0c0c0c] border border-emerald-500/20 rounded-xl p-5 text-center space-y-2 animate-pulse">
        <Sparkles className="w-6 h-6 text-emerald-400 mx-auto animate-spin" />
        <p className="text-xs font-mono font-medium text-emerald-400">
          Claude AI is reviewing your email copy...
        </p>
        <p className="text-[11px] text-zinc-500">
          Evaluating tone, conciseness, personalization, and recruiter call-to-action.
        </p>
      </div>
    );
  }

  if (!feedback) return null;

  const score = feedback.overall_score || 85;
  const scoreColor =
    score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : score >= 60 ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20';

  return (
    <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-mono ${scoreColor}`}
          >
            <span className="text-base leading-none">{score}</span>
            <span className="text-[9px] uppercase tracking-wider opacity-80">/ 100</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              AI Quality Review
            </h4>
            <p className="text-xs text-zinc-500">
              Analysis by Claude AI based on top-performing recruiter cold emails
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1.5 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Strengths and Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1.5">
          <div className="font-medium text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
          </div>
          <ul className="space-y-1 text-zinc-300">
            {feedback.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-400">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5">
          <div className="font-medium text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Opportunities
          </div>
          <ul className="space-y-1 text-zinc-300">
            {feedback.improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-400">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Subject Line Alternatives */}
      {feedback.subject_alternatives && feedback.subject_alternatives.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-white flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Recommended Subject Lines (Click to apply)
          </div>
          <div className="space-y-1.5">
            {feedback.subject_alternatives.map((subj, idx) => (
              <div
                key={idx}
                onClick={() => onApplySubject(subj)}
                className="p-2.5 bg-[#0a0a0a] hover:bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-lg text-xs font-medium text-zinc-200 flex items-center justify-between cursor-pointer transition-all group"
              >
                <span>{subj}</span>
                <span className="text-[11px] text-emerald-400 font-mono font-medium opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  Apply <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improved Body Variant */}
      {feedback.improved_body && (
        <div className="p-3.5 bg-[#0a0a0a] border border-white/5 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">AI Revised Body Variant:</span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Copy className="w-3 h-3" />}
              onClick={() => onApplyBody(feedback.improved_body!)}
            >
              Apply to Template
            </Button>
          </div>
          <div className="p-3 bg-[#080808] border border-white/5 rounded-lg font-mono text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
            {feedback.improved_body}
          </div>
        </div>
      )}
    </div>
  );
};
