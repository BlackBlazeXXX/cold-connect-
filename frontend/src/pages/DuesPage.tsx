// FILE: src/pages/DuesPage.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Send,
  CheckSquare,
  Clock,
  RefreshCw,
  Loader2,
  Send as SendIcon,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Contact, ContactStatus, RepliedAfterStage } from '../types';
import {
  useContacts,
  FollowUpStage,
  filterContactsByStage,
  getFollowUpStage,
  getDailyNewLeads,
  markLeadsAsShown,
  getRemainingLeadsCount,
  filterRepliedContacts,
  RepliedAfterFilter,
  getRepliedAfterStage,
  REPLIED_AFTER_LABELS,
} from '../hooks/useContacts';
import { useEmailLogs } from '../hooks/useEmailLogs';
import { useSettings } from '../hooks/useSettings';
import { APP_CONFIG } from '../constants/constants';
import { ContactTable } from '../components/contacts/ContactTable';
import { Button } from '../components/ui/Button';
import { Tabs, TabItem } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const VALID_TABS: Record<string, 'new' | 'followup' | 'replies'> = {
  new: 'new',
  followup: 'followup',
  follow_ups: 'followup',
  followups: 'followup',
  follow: 'followup',
  leads: 'new',
  'new-leads': 'new',
  replies: 'replies',
  'replies-due': 'replies',
  repliesdue: 'replies',
};

const VALID_STAGES: Record<string, FollowUpStage> = {
  email_sent: 'email_sent',
  'email-sent': 'email_sent',
  emailsent: 'email_sent',
  followup_1: 'followup_1',
  follow_up_1: 'followup_1',
  followup1: 'followup_1',
  'follow-up-1': 'followup_1',
  followup_2: 'followup_2',
  follow_up_2: 'followup_2',
  followup2: 'followup_2',
  'follow-up-2': 'followup_2',
  never_replied: 'never_replied',
  'never-replied': 'never_replied',
  neverreplied: 'never_replied',
};

const FOLLOW_UP_STAGE_OPTIONS: { value: FollowUpStage; label: string; description: string }[] = [
  { value: 'email_sent', label: 'Email Sent', description: 'Initial email sent, waiting for follow-up eligibility' },
  { value: 'followup_1', label: 'Follow-Up 1', description: '3 days after initial email' },
  { value: 'followup_2', label: 'Follow-Up 2', description: '7 days after initial email' },
  { value: 'never_replied', label: 'Never Replied', description: '12+ days, all follow-ups exhausted' },
];

const getStageLabel = (stage: FollowUpStage): string => {
  const option = FOLLOW_UP_STAGE_OPTIONS.find((o) => o.value === stage);
  return option?.label || stage;
};

const getStageBadgeVariant = (stage: FollowUpStage): 'success' | 'warning' | 'danger' | 'default' => {
  switch (stage) {
    case 'new': return 'success';
    case 'email_sent': return 'success';
    case 'followup_1': return 'warning';
    case 'followup_2': return 'danger';
    case 'never_replied': return 'default';
    case 'replied': return 'success';
    default: return 'default';
  }
};

const getActionLabel = (stage: FollowUpStage): string => {
  switch (stage) {
    case 'new': return 'Send Initial Email';
    case 'email_sent': return 'Send Initial Email';
    case 'followup_1': return 'Send Follow-Up 1';
    case 'followup_2': return 'Send Follow-Up 2';
    case 'never_replied': return 'No Follow-Up Action';
    default: return 'Send Email';
  }
};

export const DuesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    contacts,
    loading,
    error,
    refreshContacts,
    updateContactStatus,
    updateContact,
    deleteContact,
    toggleDoNotEmail,
  } = useContacts();
  const { logs: emailLogs } = useEmailLogs();
  const { settings } = useSettings();

  // Get daily limit from settings
  const dailyLimit = settings.new_leads_daily_limit || APP_CONFIG.newLeadsDailyLimit;

  // Read tab from URL, default to 'new' for invalid/missing values
  const urlTab = searchParams.get('tab')?.toLowerCase() || 'new';
  const initialTab = VALID_TABS[urlTab] || 'new';

  // Read follow-up stage from URL
  const urlStage = searchParams.get('stage')?.toLowerCase() || 'followup_1';
  const initialStage = VALID_STAGES[urlStage] || 'followup_1';

  const [activeTab, setActiveTab] = useState<'new' | 'followup' | 'replies'>(initialTab);
  const [activeStage, setActiveStage] = useState<FollowUpStage>(initialStage);
  const [activeReplyFilter, setActiveReplyFilter] = useState<RepliedAfterFilter>(
    (searchParams.get('replies')?.toLowerCase() as RepliedAfterFilter) || 'all'
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sync tab state with URL on mount and when searchParams change
  useEffect(() => {
    const currentUrlTab = searchParams.get('tab')?.toLowerCase() || 'new';
    const resolved = VALID_TABS[currentUrlTab] || 'new';
    setActiveTab(resolved);

    const currentUrlStage = searchParams.get('stage')?.toLowerCase() || 'followup_1';
    const resolvedStage = VALID_STAGES[currentUrlStage] || 'followup_1';
    setActiveStage(resolvedStage);

    const currentUrlReply = searchParams.get('replies')?.toLowerCase() as RepliedAfterFilter;
    if (currentUrlReply) setActiveReplyFilter(currentUrlReply);

    // Clear selection when tab/stage changes from URL
    setSelectedIds(new Set());
  }, [searchParams]);

  // Calculate follow-up stage for each contact
  const contactStages = useMemo(() => {
    const now = new Date();
    const stageMap = new Map<string, FollowUpStage>();
    for (const contact of contacts) {
      stageMap.set(contact.id, getFollowUpStage(contact, emailLogs, now));
    }
    return stageMap;
  }, [contacts, emailLogs]);

  // Daily New Leads: Get today's batch
  const { batch: newLeads, totalRemaining } = useMemo(
    () => getDailyNewLeads(contacts, emailLogs, dailyLimit, new Date()),
    [contacts, emailLogs, dailyLimit]
  );

  // Follow-ups for current stage
  const followUps = useMemo(
    () => filterContactsByStage(contacts, emailLogs, activeStage),
    [contacts, emailLogs, activeStage]
  );

  // Replied contacts with filter
  const repliedContacts = useMemo(
    () => filterRepliedContacts(contacts, emailLogs, activeReplyFilter),
    [contacts, emailLogs, activeReplyFilter]
  );

  // Count for each follow-up stage
  const stageCounts = useMemo(() => {
    const counts: Record<FollowUpStage, number> = {
      new: 0,
      email_sent: 0,
      followup_1: 0,
      followup_2: 0,
      never_replied: 0,
      replied: 0,
      do_not_email: 0,
    };
    for (const contact of contacts) {
      const stage = contactStages.get(contact.id);
      if (stage) {
        counts[stage]++;
      }
    }
    return counts;
  }, [contacts, contactStages]);

  // Per-filter counts for the Replies Due dropdown
  const repliedFilterCounts = useMemo(() => {
    const counts: Record<RepliedAfterFilter, number> = {
      all: stageCounts.replied,
      initial: 0,
      follow_up_1: 0,
      follow_up_2: 0,
      late: 0,
    };
    for (const contact of contacts) {
      if (contactStages.get(contact.id) !== 'replied') continue;
      const after = getRepliedAfterStage(contact, emailLogs);
      if (after) counts[after]++;
    }
    return counts;
  }, [contacts, contactStages, emailLogs, stageCounts.replied]);

  const currentContacts = activeTab === 'new' ? newLeads : activeTab === 'replies' ? repliedContacts : followUps;

  // Auto-mark leads as shown when they appear in the daily batch
  useEffect(() => {
    if (activeTab === 'new' && newLeads.length > 0) {
      const ids = newLeads.map((c) => c.id);
      markLeadsAsShown(ids, updateContact);
    }
  }, [activeTab, newLeads, updateContact]);

  // Sync URL when tab changes via UI
  const handleTabChange = useCallback(
    (id: string) => {
      const resolved = VALID_TABS[id] || 'new';
      setActiveTab(resolved);
      const params: Record<string, string> = { tab: resolved };
      if (resolved === 'followup') {
        params.stage = activeStage;
      }
      setSearchParams(params, { replace: true });
      setSelectedIds(new Set());
    },
    [setSearchParams, activeStage]
  );

  const handleStageChange = useCallback(
    (stage: FollowUpStage) => {
      setActiveStage(stage);
      setSearchParams({ tab: 'followup', stage }, { replace: true });
      setSelectedIds(new Set());
    },
    [setSearchParams]
  );

  const handleReplyFilterChange = useCallback(
    (filter: RepliedAfterFilter) => {
      setActiveReplyFilter(filter);
      setSearchParams({ tab: 'replies', replies: filter }, { replace: true });
      setSelectedIds(new Set());
    },
    [setSearchParams]
  );

  const handleToggleSelectId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === currentContacts.length && currentContacts.length > 0) {
        return new Set();
      }
      return new Set(currentContacts.map((c) => c.id));
    });
  }, [currentContacts]);

  const handleSelectFirst = useCallback(
    (count: number) => {
      const toSelect = currentContacts.slice(0, count).map((c) => c.id);
      setSelectedIds((prev) => new Set([...prev, ...toSelect]));
    },
    [currentContacts]
  );

  const handleBulkSend = useCallback(() => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(',');
    navigate(`/send?bulkIds=${ids}`);
  }, [selectedIds, navigate]);

  const handleContactSelect = useCallback(
    (contact: Contact) => {
      const stage = contactStages.get(contact.id) || 'new';
      if (stage === 'new') {
        navigate(`/send?contactId=${contact.id}`);
      } else if (stage === 'followup_1' || stage === 'followup_2') {
        navigate(`/send?contactId=${contact.id}&templateType=${stage}`);
      } else {
        navigate(`/send?contactId=${contact.id}`);
      }
    },
    [navigate, contactStages]
  );

  const handleSendEmail = useCallback(
    (contact: Contact) => {
      const stage = contactStages.get(contact.id) || 'new';
      if (stage === 'new') {
        navigate(`/send?contactId=${contact.id}`);
      } else if (stage === 'followup_1' || stage === 'followup_2') {
        navigate(`/send?contactId=${contact.id}&templateType=${stage}`);
      } else {
        navigate(`/send?contactId=${contact.id}`);
      }
    },
    [navigate, contactStages]
  );

  const handleUpdateStatus = useCallback(
    async (contactId: string, status: ContactStatus) => {
      await updateContactStatus(contactId, status);
    },
    [updateContactStatus]
  );

  const handleDeleteContact = useCallback(
    async (contactId: string) => {
      await deleteContact(contactId);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(contactId);
        return next;
      });
    },
    [deleteContact]
  );

  const handleToggleDoNotEmail = useCallback(
    async (contactId: string, blocked: boolean) => {
      await toggleDoNotEmail(contactId, blocked);
      if (blocked) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(contactId);
          return next;
        });
      }
    },
    [toggleDoNotEmail]
  );

  const tabs: TabItem[] = [
    {
      id: 'new',
      label: 'New Leads',
      count: newLeads.length,
      icon: <Plus className="w-3.5 h-3.5" />,
    },
    {
      id: 'followup',
      label: 'Follow-Ups Due',
      count: stageCounts.followup_1 + stageCounts.followup_2 + stageCounts.never_replied,
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      id: 'replies',
      label: 'Replies Due',
      count: stageCounts.replied,
      icon: <Send className="w-3.5 h-3.5" />,
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-zinc-500 font-mono">Loading contacts...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6 border-rose-500/20">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">Failed to load contacts</p>
            <p className="text-xs text-zinc-500 mt-0.5">{error}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refreshContacts} className="mt-4">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Dues & Tasks</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage pending outreach: new contacts to email and follow-ups due today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshContacts}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} variant="pills" />

      {/* Follow-Up Stage Selector (only when Follow-Ups Due tab is active) */}
      {activeTab === 'followup' && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Follow-Up Stage:</span>
              <div className="relative">
                <select
                  value={activeStage}
                  onChange={(e) => handleStageChange(e.target.value as FollowUpStage)}
                  className="bg-black border border-white/10 text-sm text-white rounded-lg outline-none px-3 py-1.5 pr-8 cursor-pointer appearance-none hover:border-white/20 transition-colors"
                  style={{ WebkitAppearance: 'none' }}
                >
                  {FOLLOW_UP_STAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({stageCounts[option.value] || 0})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500">
              {FOLLOW_UP_STAGE_OPTIONS.find((o) => o.value === activeStage)?.description}
            </p>
          </div>
        </Card>
      )}

      {/* Reply Filter Selector (only when Replies Due tab is active) */}
      {activeTab === 'replies' && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Replied:</span>
              <div className="relative">
                <select
                  value={activeReplyFilter}
                  onChange={(e) => handleReplyFilterChange(e.target.value as RepliedAfterFilter)}
                  className="bg-black border border-white/10 text-sm text-white rounded-lg outline-none px-3 py-1.5 pr-8 cursor-pointer appearance-none hover:border-white/20 transition-colors"
                  style={{ WebkitAppearance: 'none' }}
                >
                  <option value="all">All Replies ({stageCounts.replied || 0})</option>
                  <option value="initial">After Initial Email ({repliedFilterCounts.initial})</option>
                  <option value="follow_up_1">After Follow-Up 1 ({repliedFilterCounts.follow_up_1})</option>
                  <option value="follow_up_2">After Follow-Up 2 ({repliedFilterCounts.follow_up_2})</option>
                  <option value="late">Late Reply ({repliedFilterCounts.late})</option>
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500">
              Contacts who replied to your outreach — classified automatically by stage.
            </p>
          </div>
        </Card>
      )}

      {/* Action Bar */}
      {(currentContacts.length > 0 || selectedIds.size > 0) && (
        <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <Badge
              variant={activeTab === 'new' ? 'success' : activeTab === 'replies' ? 'success' : getStageBadgeVariant(activeStage)}
              size="sm"
              className="flex items-center gap-1.5"
            >
              {activeTab === 'new' ? (
                <Plus className="w-3 h-3" />
              ) : activeTab === 'replies' ? (
                <Send className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {activeTab === 'new' ? (
                <>
                  {currentContacts.length} New Leads today
                  {totalRemaining > currentContacts.length && (
                    <span className="text-zinc-400 ml-1">({totalRemaining - currentContacts.length} remaining)</span>
                  )}
                </>
              ) : activeTab === 'replies' ? (
                <>
                  {currentContacts.length} Replied
                  {activeReplyFilter !== 'all' && (
                    <span className="text-zinc-400 ml-1">({REPLIED_AFTER_LABELS[activeReplyFilter as RepliedAfterStage]})</span>
                  )}
                </>
              ) : (
                <>
                  {currentContacts.length} {getStageLabel(activeStage)}
                </>
              )}
            </Badge>

            {selectedIds.size > 0 && (
              <Badge variant="default" size="sm" className="flex items-center gap-1.5">
                <CheckSquare className="w-3 h-3" />
                {selectedIds.size} Selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'new' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSelectFirst(dailyLimit)}
                disabled={currentContacts.length === 0}
                leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
              >
                Select First {dailyLimit}
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSelectFirst(10)}
                  disabled={currentContacts.length === 0}
                  leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
                >
                  Select First 10
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSelectFirst(25)}
                  disabled={currentContacts.length === 0}
                  leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
                >
                  Select First 25
                </Button>
              </>
            )}
            {selectedIds.size > 0 && activeTab === 'new' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkSend}
                leftIcon={<SendIcon className="w-3.5 h-3.5" />}
              >
                Bulk Send ({selectedIds.size})
              </Button>
            )}
            {selectedIds.size > 0 && activeTab === 'followup' && activeStage !== 'never_replied' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkSend}
                leftIcon={<SendIcon className="w-3.5 h-3.5" />}
              >
                Bulk Send ({selectedIds.size})
              </Button>
            )}
            {selectedIds.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                leftIcon={<Clock className="w-3.5 h-3.5" />}
              >
                Clear Selection
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Contact Table */}
      <Card className="p-0 overflow-hidden">
        {currentContacts.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              {activeTab === 'new' ? (
                <Plus className="w-8 h-8 text-zinc-600" />
              ) : activeTab === 'replies' ? (
                <Send className="w-8 h-8 text-zinc-600" />
              ) : (
                <Clock className="w-8 h-8 text-zinc-600" />
              )}
            </div>
            <h3 className="text-lg font-medium text-white mb-1">
              {activeTab === 'new' ? 'No New Leads' : activeTab === 'replies' ? 'No Replies Detected' : `No ${getStageLabel(activeStage)} Contacts`}
            </h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              {activeTab === 'new'
                ? 'All caught up! No new contacts waiting for initial outreach.'
                : activeTab === 'replies'
                ? 'No contacts have replied' + (activeReplyFilter !== 'all' ? ` ${REPLIED_AFTER_LABELS[activeReplyFilter as RepliedAfterStage]}` : '') + ' yet. Replies will appear here automatically when detected.'
                : activeStage === 'never_replied'
                ? 'No contacts have reached the Never Replied stage yet.'
                : `No contacts are currently in the ${getStageLabel(activeStage)} stage.`}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              {activeTab === 'new' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/upload')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Import Contacts
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTabChange('new')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  View New Leads Instead
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ContactTable
            contacts={currentContacts}
            onSelectContact={handleContactSelect}
            onSendEmail={handleSendEmail}
            onDeleteContact={handleDeleteContact}
            onUpdateStatus={handleUpdateStatus}
            onToggleDoNotEmail={handleToggleDoNotEmail}
            selectedIds={selectedIds}
            onToggleSelectId={handleToggleSelectId}
            onToggleSelectAll={handleToggleSelectAll}
            showCheckboxes={true}
          />
        )}
      </Card>
    </div>
  );
};
