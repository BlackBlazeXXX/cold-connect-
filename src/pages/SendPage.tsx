// FILE: src/pages/SendPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, Eye, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { useSettings } from '../hooks/useSettings';
import { useDailyLimit } from '../hooks/useDailyLimit';
import { useEmailLogs } from '../hooks/useEmailLogs';
import { Contact, EmailTemplate, ContactStatus } from '../types';
import { composeMail } from '../lib/emailComposer';
import { sendEmailViaResend } from '../lib/resend';
import { ContactSelector } from '../components/send/ContactSelector';
import { PersonalizationCard } from '../components/send/PersonalizationCard';
import { ResumeAttachBar } from '../components/send/ResumeAttachBar';
import { SendProgressBar } from '../components/send/SendProgressBar';
import { SendConfirmModal } from '../components/send/SendConfirmModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const SendPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { contacts, updateContactStatus, scheduleFollowUp } = useContacts();
  const { templates, defaultTemplate } = useTemplates();
  const { settings } = useSettings();
  const { sentToday, dailyLimit, remainingToday, incrementCount, isLimitReached } =
    useDailyLimit();
  const { logEmail } = useEmailLogs();

  // Mode: single or bulk
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedBulkIds, setSelectedBulkIds] = useState<Set<string>>(new Set());

  // Template chosen
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Editable fields for personalization
  const [hrName, setHrName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [subject, setSubject] = useState('');

  // Send state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<{
    current: number;
    total: number;
    currentName?: string;
    currentCompany?: string;
    successCount: number;
    failedCount: number;
    failures: { name: string; email: string; reason: string }[];
    isComplete: boolean;
  } | null>(null);

  // Initialize from search params or defaults
  useEffect(() => {
    const contactIdParam = searchParams.get('contactId');
    const bulkIdsParam = searchParams.get('bulkIds');
    const templateTypeParam = searchParams.get('templateType');

    if (contactIdParam && contacts.length > 0) {
      const match = contacts.find((c) => c.id === contactIdParam);
      if (match) {
        setSelectedContact(match);
        setMode('single');
      }
    } else if (bulkIdsParam && contacts.length > 0) {
      const ids = bulkIdsParam.split(',').filter(Boolean);
      setSelectedBulkIds(new Set(ids));
      setMode('bulk');
    }

    if (templateTypeParam && templates.length > 0) {
      const match = templates.find((t) => t.type === templateTypeParam);
      if (match) {
        setSelectedTemplateId(match.id);
      }
    } else if (!selectedTemplateId && templates.length > 0) {
      const def = templates.find((t) => t.is_default) || templates[0];
      if (def) {
        setSelectedTemplateId(def.id);
      }
    }
  }, [searchParams, contacts.length, templates.length, selectedTemplateId]);

  // Default to first contact if none selected
  useEffect(() => {
    if (!selectedContact && contacts.length > 0 && mode === 'single') {
      const uncontacted = contacts.find((c) => !c.do_not_email && c.status === 'New') || contacts[0];
      setSelectedContact(uncontacted);
    }
  }, [contacts.length, selectedContact, mode]);

  // Sync personalization inputs when single contact or template changes
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || defaultTemplate;

  useEffect(() => {
    if (selectedContact && mode === 'single') {
      setHrName(selectedContact.hr_name);
      setCompanyName(selectedContact.company_name);
      setJobRole(selectedContact.job_role || '');
    }
  }, [selectedContact?.id, mode]);

  useEffect(() => {
    if (activeTemplate?.subject) {
      setSubject(activeTemplate.subject);
    }
  }, [activeTemplate?.id]);

  // Bulk helper: select top eligible contacts
  const handleSelectAllEligibleBulk = () => {
    const eligible = contacts.filter((c) => !c.do_not_email);
    const capped = eligible.slice(0, remainingToday);
    setSelectedBulkIds(new Set(capped.map((c) => c.id)));
  };

  const handleToggleBulkId = (id: string) => {
    const next = new Set(selectedBulkIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (next.size >= remainingToday) {
        alert(`Selection capped at remaining daily limit (${remainingToday}).`);
        return;
      }
      next.add(id);
    }
    setSelectedBulkIds(next);
  };

  // Preview composition
  const currentPreviewContact =
    mode === 'single' && selectedContact
      ? {
          hr_name: hrName || selectedContact.hr_name,
          company_name: companyName || selectedContact.company_name,
          job_role: jobRole || selectedContact.job_role,
          email: selectedContact.email,
        }
      : {
          hr_name: 'Hiring Manager',
          company_name: 'Target Company',
          job_role: 'Desired Position',
          email: 'recruiter@company.com',
        };

  const composedPreview = composeMail(
    { subject: subject || activeTemplate?.subject || '', body: activeTemplate?.body || '' },
    currentPreviewContact,
    settings
  );

  // Recipient list for send
  const recipientsToSend: Contact[] =
    mode === 'single'
      ? selectedContact && !selectedContact.do_not_email
        ? [selectedContact]
        : []
      : contacts.filter((c) => selectedBulkIds.has(c.id) && !c.do_not_email);

  // EXECUTE CAMPAIGN DISPATCH
  const handleStartSending = async () => {
    setIsConfirmModalOpen(false);
    setIsSending(true);

    const total = recipientsToSend.length;
    setSendProgress({
      current: 0,
      total,
      successCount: 0,
      failedCount: 0,
      failures: [],
      isComplete: false,
    });

    let success = 0;
    let failed = 0;
    const failures: { name: string; email: string; reason: string }[] = [];

    for (let i = 0; i < total; i++) {
      const contact = recipientsToSend[i];

      setSendProgress((prev) =>
        prev
          ? {
              ...prev,
              current: i + 1,
              currentName: contact.hr_name,
              currentCompany: contact.company_name,
            }
          : null
      );

      try {
        // Compose personalized email
        const composed = composeMail(
          { subject, body: activeTemplate?.body || '' },
          contact,
          settings
        );

        // Send via Resend utility
        const result = await sendEmailViaResend({
          apiKey: settings.resend_api_key || 're_demo',
          from: `${settings.sender_name || 'Candidate'} <${
            settings.sender_email || 'onboarding@resend.dev'
          }>`,
          to: contact.email,
          replyTo: settings.reply_to_email || settings.sender_email,
          subject: composed.subject,
          html: composed.htmlBody,
        });

        if (result.success) {
          success++;

          // 1. Log to email_logs
          await logEmail({
            contact_id: contact.id,
            template_id: activeTemplate?.id || null,
            email_type:
              activeTemplate?.type === 'Follow-up 1'
                ? 'follow_up_1'
                : activeTemplate?.type === 'Follow-up 2'
                ? 'follow_up_2'
                : 'initial',
            subject_used: composed.subject,
            body_used: composed.plainTextBody,
            status: 'sent',
            error_message: null,
          });

          // 2. Update contact status & schedule follow-up
          let nextStatus: ContactStatus = 'Email Sent';
          let followUpDays = settings.default_follow_up_days || 3;

          if (contact.status === 'Email Sent') {
            nextStatus = 'Follow-Up 1 Sent';
            followUpDays = settings.default_follow_up_2_days || 7;
          } else if (contact.status === 'Follow-Up 1 Sent') {
            nextStatus = 'Follow-Up 2 Sent';
            followUpDays = 0; // Final follow-up
          }

          await updateContactStatus(contact.id, nextStatus);

          if (followUpDays > 0) {
            await scheduleFollowUp(contact.id, followUpDays);
          }

          // 3. Increment daily limit counter
          await incrementCount();
        } else {
          failed++;
          failures.push({
            name: contact.hr_name,
            email: contact.email,
            reason: result.error || 'Delivery rejected',
          });
        }
      } catch (err: any) {
        failed++;
        failures.push({
          name: contact.hr_name,
          email: contact.email,
          reason: err.message || 'Network exception',
        });
      }

      setSendProgress((prev) =>
        prev
          ? {
              ...prev,
              successCount: success,
              failedCount: failed,
              failures,
            }
          : null
      );

      // Stagger sends by 2 seconds to simulate human pacing & protect sender reputation
      if (i < total - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setSendProgress((prev) => (prev ? { ...prev, isComplete: true } : null));
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      {/* If daily quota is exhausted */}
      {isLimitReached && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-xs text-rose-400">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <div>
            <strong>Daily outreach limit reached ({dailyLimit}/{dailyLimit}):</strong> You cannot
            dispatch more emails today to protect your domain reputation. Limit resets at midnight.
          </div>
        </div>
      )}

      {/* Sending Progress Bar if active */}
      {sendProgress && (
        <SendProgressBar
          current={sendProgress.current}
          total={sendProgress.total}
          currentRecipientName={sendProgress.currentName}
          currentCompanyName={sendProgress.currentCompany}
          successCount={sendProgress.successCount}
          failedCount={sendProgress.failedCount}
          failures={sendProgress.failures}
          isComplete={sendProgress.isComplete}
          onDone={() => {
            setSendProgress(null);
            navigate('/contacts');
          }}
        />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Selectors and Config */}
        <div className="space-y-5">
          {/* Recipient Selection Card */}
          <ContactSelector
            contacts={contacts}
            mode={mode}
            onModeChange={setMode}
            selectedContact={selectedContact}
            onSelectSingleContact={(c) => setSelectedContact(c)}
            selectedBulkIds={selectedBulkIds}
            onToggleBulkId={handleToggleBulkId}
            onSelectAllEligibleBulk={handleSelectAllEligibleBulk}
            remainingDailyLimit={remainingToday}
          />

          {/* Template Selector Card */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white tracking-tight">Email Template</h4>
              <button
                type="button"
                onClick={() => navigate('/templates')}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                Manage Templates &rarr;
              </button>
            </div>

            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#0c0c0c] text-white">
                  {t.name} ({t.type}) {t.is_default ? '★ Default' : ''}
                </option>
              ))}
            </select>
          </Card>

          {/* Personalization Details Card */}
          {mode === 'single' && (
            <PersonalizationCard
              hrName={hrName}
              companyName={companyName}
              jobRole={jobRole}
              subject={subject}
              senderName={settings.sender_name || 'Candidate'}
              onChangeHrName={setHrName}
              onChangeCompany={setCompanyName}
              onChangeJobRole={setJobRole}
              onChangeSubject={setSubject}
              anthropicApiKey={settings.anthropic_api_key}
            />
          )}

          {/* Resume Bar */}
          <ResumeAttachBar settings={settings} />
        </div>

        {/* Right Column: Live Merge Preview & Action */}
        <div className="space-y-5">
          <Card className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5 tracking-tight">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  Final Email Preview
                </h4>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  {recipientsToSend.length} {recipientsToSend.length === 1 ? 'recipient' : 'recipients'} ready
                </span>
              </div>

              {/* Formatted preview of email client */}
              <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0c0c0c] text-xs">
                <div className="p-3 bg-[#0a0a0a] border-b border-white/5 space-y-1">
                  <div>
                    <span className="text-zinc-500 font-mono">From: </span>
                    <span className="font-medium text-zinc-200">
                      {settings.sender_name || 'You'} &lt;
                      {settings.sender_email || 'onboarding@resend.dev'}&gt;
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-mono">To: </span>
                    <span className="font-medium text-zinc-200">
                      {currentPreviewContact.hr_name} &lt;{currentPreviewContact.email}&gt;
                    </span>
                  </div>
                  <div className="pt-1 border-t border-white/5">
                    <span className="text-zinc-500 font-mono">Subject: </span>
                    <span className="font-semibold text-white">{composedPreview.subject}</span>
                  </div>
                </div>

                <div className="p-5 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans min-h-[260px] bg-[#0c0c0c]">
                  {composedPreview.plainTextBody}
                </div>
              </div>
            </div>

            {/* Bottom Dispatch Button */}
            <div className="pt-3 border-t border-white/5">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                leftIcon={<Send className="w-4 h-4" />}
                disabled={
                  recipientsToSend.length === 0 ||
                  isLimitReached ||
                  isSending ||
                  (mode === 'single' && selectedContact?.do_not_email)
                }
                onClick={() => setIsConfirmModalOpen(true)}
              >
                Dispatch Outreach (
                {recipientsToSend.length} {recipientsToSend.length === 1 ? 'Email' : 'Emails'})
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <SendConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleStartSending}
        recipientCount={recipientsToSend.length}
        senderName={settings.sender_name || 'Candidate'}
        senderEmail={settings.sender_email || 'onboarding@resend.dev'}
        sentToday={sentToday}
        dailyLimit={dailyLimit}
        isSending={isSending}
      />
    </div>
  );
};
