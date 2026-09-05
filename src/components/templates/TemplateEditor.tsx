// FILE: src/components/templates/TemplateEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Save, Sparkles, Clock, Check, Star, RefreshCw } from 'lucide-react';
import { EmailTemplate, TemplateVersion, UserSettings, AIEmailFeedback } from '../../types';
import { Tabs } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PlaceholderHelper } from './PlaceholderHelper';
import { TemplatePreview } from './TemplatePreview';
import { VersionHistory } from './VersionHistory';
import { AIFeedbackPanel } from './AIFeedbackPanel';
import { getEmailFeedback, generateSubjectSuggestions } from '../../lib/anthropic';

export interface TemplateEditorProps {
  template: EmailTemplate | null;
  versions: TemplateVersion[];
  settings: Partial<UserSettings>;
  onSave: (templateData: Partial<EmailTemplate>) => Promise<void>;
  onSaveNewVersion: (templateId: string, subject: string, body: string) => Promise<void>;
  onRestoreVersion: (version: TemplateVersion) => void;
  anthropicApiKey?: string;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  versions,
  settings,
  onSave,
  onSaveNewVersion,
  onRestoreVersion,
  anthropicApiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'versions'>('edit');
  const [name, setName] = useState('');
  const [type, setType] = useState<any>('Initial');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // AI Review states
  const [aiFeedback, setAiFeedback] = useState<AIEmailFeedback | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSubjects, setAiSubjects] = useState<string[]>([]);
  const [isGeneratingSubject, setIsGeneratingSubject] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync state when selected template changes
  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setType(template.type || 'Initial');
      setSubject(template.subject || '');
      setBody(template.body || '');
      setIsDefault(Boolean(template.is_default));
      setAiFeedback(null);
    } else {
      setName('');
      setType('Initial');
      setSubject('');
      setBody('');
      setIsDefault(false);
      setAiFeedback(null);
    }
  }, [template?.id]);

  if (!template) {
    return (
      <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-12 text-center text-zinc-500 flex flex-col items-center justify-center h-full">
        <Sparkles className="w-10 h-10 text-zinc-600 mb-3" />
        <h4 className="text-sm font-semibold text-white tracking-tight">No template selected</h4>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          Choose a template from the list on the left to edit or preview, or create a brand new one.
        </p>
      </div>
    );
  }

  // Insert merge tag at cursor position
  const handleInsertPlaceholder = (placeholderKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setBody((prev) => prev + placeholderKey);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = body.substring(0, start) + placeholderKey + body.substring(end);
    setBody(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholderKey.length, start + placeholderKey.length);
    }, 0);
  };

  // Word count and estimated read time
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const readTimeSeconds = Math.ceil((wordCount / 200) * 60);

  // Save changes handler
  const handleSave = async (saveAsVersion: boolean = false) => {
    setIsSaving(true);
    try {
      if (saveAsVersion) {
        await onSaveNewVersion(template.id, subject, body);
      }
      await onSave({
        name,
        type,
        subject,
        body,
        is_default: isDefault,
      });
      setIsSavedSuccess(true);
      setTimeout(() => setIsSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // AI Review
  const handleRunAiReview = async () => {
    setIsAiLoading(true);
    try {
      const feedback = await getEmailFeedback(subject, body, anthropicApiKey);
      setAiFeedback(feedback);
    } catch (err) {
      console.error('AI review error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate subjects with AI
  const handleSuggestSubjects = async () => {
    setIsGeneratingSubject(true);
    try {
      const suggestions = await generateSubjectSuggestions(
        'Product Designer / Software Engineer',
        'Top Tech Company',
        'Alex Candidate',
        anthropicApiKey
      );
      setAiSubjects(suggestions);
    } catch (err) {
      console.error('Subject suggestion error:', err);
    } finally {
      setIsGeneratingSubject(false);
    }
  };

  const tabs = [
    { id: 'edit', label: 'Edit Template' },
    { id: 'preview', label: 'Live Preview' },
    { id: 'versions', label: 'Version History', count: versions.length },
  ];

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Top Header & Tabs */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0a0a]">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as any)}
          variant="pills"
        />

        <div className="flex items-center gap-2">
          {isSavedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono font-medium animate-in fade-in">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSave(true)}
            isLoading={isSaving}
          >
            Save as New Version
          </Button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Save className="w-3.5 h-3.5" />}
            onClick={() => handleSave(false)}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        {activeTab === 'edit' && (
          <div className="space-y-4">
            {/* Meta Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Template Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Initial Recruiter Outreach"
              />

              <div>
                <label className="block text-xs font-medium text-white mb-1.5">
                  Template Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#0a0a0a] border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Initial" className="bg-[#0c0c0c] text-white">Initial Outreach</option>
                  <option value="Follow-up 1" className="bg-[#0c0c0c] text-white">Follow-up 1 (Day 3-5)</option>
                  <option value="Follow-up 2" className="bg-[#0c0c0c] text-white">Follow-up 2 (Day 8-10)</option>
                  <option value="Custom" className="bg-[#0c0c0c] text-white">Custom Template</option>
                </select>
              </div>
            </div>

            {/* Subject Line & AI Generator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-white">Subject Line</label>
                <button
                  type="button"
                  onClick={handleSuggestSubjects}
                  disabled={isGeneratingSubject}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isGeneratingSubject ? 'Generating...' : 'AI Subject Ideas'}</span>
                </button>
              </div>

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Quick question regarding {Job_Role} at {Company_Name}"
                className="w-full bg-[#0a0a0a] border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
              />

              {/* AI Subject Suggestions pills */}
              {aiSubjects.length > 0 && (
                <div className="mt-2 p-2.5 bg-[#0c0c0c] border border-emerald-500/20 rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="text-[11px] font-mono font-medium text-emerald-400">
                    Suggested Subjects (Click to apply):
                  </div>
                  {aiSubjects.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSubject(s)}
                      className="p-1.5 bg-[#0a0a0a] hover:bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-200 cursor-pointer transition-colors"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Merge Tags / Placeholder Helper Bar */}
            <div className="pt-2 border-t border-white/5">
              <PlaceholderHelper onInsert={handleInsertPlaceholder} />
            </div>

            {/* Email Body Editor */}
            <div>
              <label className="block text-xs font-medium text-white mb-1.5">
                Email Body Copy
              </label>
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Hi {HR_Name},&#10;&#10;I noticed the {Job_Role} opening at {Company_Name} and wanted to reach out directly..."
                className="w-full font-mono text-xs text-zinc-200 bg-[#080808] border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl p-4 leading-relaxed outline-none transition-all resize-y placeholder-zinc-600"
              />

              {/* Word count & Reading Time bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px] text-zinc-500 font-mono">
                <div className="flex items-center gap-3">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{body.length} characters</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    ~{readTimeSeconds}s read
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-zinc-300 font-medium">Default template</span>
                  </label>

                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                    onClick={handleRunAiReview}
                    isLoading={isAiLoading}
                  >
                    Review with AI
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Feedback Section */}
            {(aiFeedback || isAiLoading) && (
              <AIFeedbackPanel
                feedback={aiFeedback}
                isLoading={isAiLoading}
                onApplySubject={(newSubj) => setSubject(newSubj)}
                onApplyBody={(newBody) => setBody(newBody)}
                onDismiss={() => setAiFeedback(null)}
              />
            )}
          </div>
        )}

        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <TemplatePreview subject={subject} body={body} settings={settings} />
        )}

        {/* VERSIONS TAB */}
        {activeTab === 'versions' && (
          <VersionHistory versions={versions} onRestoreVersion={onRestoreVersion} />
        )}
      </div>
    </div>
  );
};
