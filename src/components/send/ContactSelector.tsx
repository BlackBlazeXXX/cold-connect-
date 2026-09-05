// FILE: src/components/send/ContactSelector.tsx
import React, { useState } from 'react';
import { Search, AlertTriangle, Ban, CheckCircle2, Users, User } from 'lucide-react';
import { Contact } from '../../types';
import { Badge } from '../ui/Badge';
import { isToday } from 'date-fns';

export interface ContactSelectorProps {
  contacts: Contact[];
  mode: 'single' | 'bulk';
  onModeChange: (mode: 'single' | 'bulk') => void;
  selectedContact: Contact | null;
  onSelectSingleContact: (contact: Contact) => void;
  selectedBulkIds: Set<string>;
  onToggleBulkId: (id: string) => void;
  onSelectAllEligibleBulk: () => void;
  remainingDailyLimit: number;
}

export const ContactSelector: React.FC<ContactSelectorProps> = ({
  contacts,
  mode,
  onModeChange,
  selectedContact,
  onSelectSingleContact,
  selectedBulkIds,
  onToggleBulkId,
  onSelectAllEligibleBulk,
  remainingDailyLimit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Eligible contacts for outreach (filter out do_not_email)
  const eligibleContacts = contacts.filter((c) => !c.do_not_email);
  const filteredContacts = eligibleContacts.filter(
    (c) =>
      c.hr_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Mode Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Recipient Selection</h4>
          <p className="text-xs text-zinc-500">
            Choose a single recruiter for targeted outreach or batch multiple contacts.
          </p>
        </div>

        <div className="inline-flex bg-[#0a0a0a] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onModeChange('single')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mode === 'single'
                ? 'bg-white/10 text-white shadow-xs'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Single Contact</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('bulk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              mode === 'bulk'
                ? 'bg-white/10 text-white shadow-xs'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Bulk Send</span>
          </button>
        </div>
      </div>

      {/* SINGLE MODE */}
      {mode === 'single' ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recruiter or company..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500/50 text-white placeholder-zinc-500"
            />
          </div>

          <div className="max-h-48 overflow-y-auto border border-white/5 rounded-xl divide-y divide-white/5 bg-[#0a0a0a]">
            {filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500 font-mono">
                No matching recruiters found.
              </div>
            ) : (
              filteredContacts.slice(0, 20).map((c) => {
                const isSelected = selectedContact?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectSingleContact(c)}
                    className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-white/5 text-white font-medium'
                        : 'hover:bg-white/[0.02] text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white">{c.hr_name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        {c.company_name} • {c.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        {c.status}
                      </Badge>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Warnings for single selection */}
          {selectedContact && (
            <div className="space-y-2">
              {selectedContact.do_not_email && (
                <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs flex items-center gap-2">
                  <Ban className="w-4 h-4 shrink-0" />
                  <span>
                    ⚠️ This contact is on your <strong>Do Not Email</strong> list. Outreach is
                    blocked.
                  </span>
                </div>
              )}

              {selectedContact.last_sent_at &&
                isToday(new Date(selectedContact.last_sent_at)) && (
                  <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      ⚠️ You already emailed {selectedContact.hr_name} today. Are you sure you want to
                      send another?
                    </span>
                  </div>
                )}
            </div>
          )}
        </div>
      ) : (
        /* BULK MODE */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="text-zinc-400">
              <strong className="text-white font-mono">{selectedBulkIds.size}</strong> recruiters
              selected (capped at remaining quota: {remainingDailyLimit})
            </div>

            <button
              type="button"
              onClick={onSelectAllEligibleBulk}
              className="text-emerald-400 font-mono font-medium hover:underline cursor-pointer"
            >
              Select Top {Math.min(remainingDailyLimit, eligibleContacts.length)} Eligible
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto border border-white/5 rounded-xl divide-y divide-white/5 bg-[#0a0a0a]">
            {eligibleContacts.slice(0, 30).map((c) => {
              const isChecked = selectedBulkIds.has(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => onToggleBulkId(c.id)}
                  className="p-2.5 flex items-center justify-between text-xs hover:bg-white/[0.02] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleBulkId(c.id)}
                      className="rounded border-white/20 bg-white/5 text-emerald-500 accent-emerald-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <span className="font-medium text-white">{c.hr_name}</span>{' '}
                      <span className="text-zinc-500">({c.company_name})</span>
                      <div className="text-[11px] font-mono text-zinc-500">{c.email}</div>
                    </div>
                  </div>

                  <Badge variant="neutral" size="sm">
                    {c.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
