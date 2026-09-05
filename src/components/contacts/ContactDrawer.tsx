// FILE: src/components/contacts/ContactDrawer.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Building2,
  Calendar,
  Send,
  MessageSquare,
  Clock,
  FileText,
  User,
  ChevronRight,
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Tabs } from '../ui/Tabs';
import { StatusBadge } from './StatusBadge';
import { ReplyCounter } from './ReplyCounter';
import { NotesField } from './NotesField';
import { DoNotEmailToggle } from './DoNotEmailToggle';
import { Button } from '../ui/Button';
import { Contact, EmailLog, ContactStatus } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';

export interface ContactDrawerProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  emailLogs: EmailLog[];
  onUpdateStatus: (id: string, status: ContactStatus) => void;
  onMarkReplied: (id: string) => void;
  onToggleDoNotEmail: (id: string, blocked: boolean) => void;
  onSaveNotes: (id: string, notes: string) => void;
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  contact,
  isOpen,
  onClose,
  emailLogs,
  onUpdateStatus,
  onMarkReplied,
  onToggleDoNotEmail,
  onSaveNotes,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'notes'>('overview');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!contact) return null;

  const contactLogs = emailLogs.filter((l) => l.contact_id === contact.id);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Email History', count: contactLogs.length },
    { id: 'notes', label: 'Notes' },
  ];

  const handleSendSingle = () => {
    navigate(`/send?contactId=${contact.id}`);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="lg"
      title={
        <div className="flex items-center gap-2">
          <span>{contact.hr_name}</span>
          <StatusBadge
            status={contact.status}
            onChangeStatus={(st) => onUpdateStatus(contact.id, st)}
          />
        </div>
      }
      subtitle={
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-300">{contact.company_name}</span>
          {contact.job_role && <span>• {contact.job_role}</span>}
        </div>
      }
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
          variant="underline"
        />

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={handleSendSingle}
                disabled={contact.do_not_email}
              >
                Send Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                onClick={() => onMarkReplied(contact.id)}
              >
                Mark Replied
              </Button>
            </div>

            {/* Core Details Card */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </span>
                <a
                  href={`mailto:${contact.email}`}
                  className="font-mono text-emerald-400 hover:underline"
                >
                  {contact.email}
                </a>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Company
                </span>
                <span className="font-medium text-white">{contact.company_name}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Job Position
                </span>
                <span className="font-medium text-zinc-300">
                  {contact.job_role || 'Not specified'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Follow-Up Due
                </span>
                <span className="font-medium font-mono">
                  {contact.follow_up_due_at ? (
                    <span className="text-amber-400 font-medium">
                      {format(new Date(contact.follow_up_due_at), 'MMM d, yyyy')} (
                      {formatDistanceToNow(new Date(contact.follow_up_due_at), { addSuffix: true })}
                      )
                    </span>
                  ) : (
                    <span className="text-zinc-600">None scheduled</span>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date Added
                </span>
                <span className="text-zinc-400 font-mono">
                  {format(new Date(contact.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            {/* Replies and Block controls */}
            <div className="p-4 bg-[#0a0a0a] border border-white/5 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white tracking-tight">Total Responses</div>
                <div className="text-[11px] text-zinc-500">Replies tracked from this recruiter</div>
              </div>
              <ReplyCounter
                count={contact.reply_count}
                onMarkReplied={() => onMarkReplied(contact.id)}
              />
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-white/5">
              <span className="text-xs text-zinc-500">Outreach status:</span>
              <DoNotEmailToggle
                contact={contact}
                onToggle={(blocked) => onToggleDoNotEmail(contact.id, blocked)}
              />
            </div>
          </div>
        )}

        {/* EMAIL HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {contactLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">
                <Mail className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                No outreach emails logged yet.
              </div>
            ) : (
              contactLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className="border border-white/5 rounded-xl overflow-hidden bg-[#0c0c0c] text-xs"
                  >
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-3 bg-[#0a0a0a] flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-white tracking-tight">{log.subject_used}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                          {format(new Date(log.sent_at), 'MMM d, yyyy • h:mm a')} •{' '}
                          <span className="capitalize text-emerald-400 font-medium">
                            {log.email_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-zinc-500 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    {isExpanded && (
                      <div className="p-4 border-t border-white/5 bg-[#080808] font-mono text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                        {log.body_used}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <NotesField
            initialNotes={contact.notes}
            onSave={(newNotes) => onSaveNotes(contact.id, newNotes)}
          />
        )}
      </div>
    </Drawer>
  );
};
