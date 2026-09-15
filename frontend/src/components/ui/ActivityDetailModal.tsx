import React from 'react';
import { X, Send, MessageSquare, User, Building2, Mail, Clock, FileText } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { EmailLog, Contact } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';

export interface ActivityDetailModalProps {
  log: EmailLog;
  contact: Contact | null;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  log,
  contact,
  onClose,
}) => {
  const typeLabel =
    log.email_type === 'initial'
      ? 'Initial Email'
      : log.email_type === 'follow_up_1'
      ? 'Follow-Up 1'
      : log.email_type === 'follow_up_2'
      ? 'Follow-Up 2'
      : 'Follow-Up 3';

  const typeVariant =
    log.email_type === 'initial'
      ? 'info'
      : log.email_type === 'follow_up_1'
      ? 'warning'
      : 'neutral';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-[#0c0c0c] border border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Email Detail</h3>
              <p className="text-[11px] text-zinc-500 font-mono">{log.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                <Mail className="w-3 h-3" /> Recipient
              </div>
              <p className="text-xs text-white font-medium truncate">{log.recipient_email}</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                <FileText className="w-3 h-3" /> Type
              </div>
              <Badge variant={typeVariant as any} size="sm">{typeLabel}</Badge>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                <Clock className="w-3 h-3" /> Sent At
              </div>
              <p className="text-xs text-white font-mono">{format(new Date(log.sent_at), 'MMM d, yyyy h:mm a')}</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{formatDistanceToNow(new Date(log.sent_at), { addSuffix: true })}</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                <MessageSquare className="w-3 h-3" /> Status
              </div>
              <Badge variant={log.status === 'sent' ? 'success' : log.status === 'failed' ? 'danger' : 'warning'} size="sm">
                {log.status}
              </Badge>
            </div>
          </div>

          {contact && (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                <User className="w-3 h-3" /> Contact
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white font-medium">
                  {contact.hr_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs text-white font-medium">{contact.hr_name}</p>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {contact.company_name}
                    {contact.job_role && <span className="text-zinc-600">· {contact.job_role}</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
              <FileText className="w-3 h-3" /> Subject
            </div>
            <p className="text-xs text-white">{log.subject_used}</p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
              <FileText className="w-3 h-3" /> Body Preview
            </div>
            <p className="text-xs text-zinc-300 whitespace-pre-wrap line-clamp-6">{log.body_used}</p>
          </div>

          {log.error_message && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3">
              <p className="text-[10px] text-rose-400 uppercase tracking-wider mb-1">Error</p>
              <p className="text-xs text-rose-300">{log.error_message}</p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-white/5">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};