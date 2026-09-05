// FILE: src/pages/DashboardPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Send,
  MessageSquare,
  Clock,
  TrendingUp,
  UploadCloud,
  FileText,
  AlertCircle,
  BarChart2,
  Settings,
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useContacts } from '../hooks/useContacts';
import { useTemplates } from '../hooks/useTemplates';
import { useDailyLimit } from '../hooks/useDailyLimit';
import { useSettings } from '../hooks/useSettings';
import { StatCard } from '../components/ui/StatCard';
import { DailyLimitBar } from '../components/dashboard/DailyLimitBar';
import { FollowUpSection } from '../components/dashboard/FollowUpSection';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import { QuickSendCard } from '../components/dashboard/QuickSendCard';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboard, loading: dashLoading } = useDashboard();
  const { contacts, updateContactStatus, markReplied, snoozeFollowUp } = useContacts();
  const { templates, defaultTemplate } = useTemplates();
  const { sentToday, dailyLimit, percentUsed, remainingToday } = useDailyLimit();
  const { isSetupComplete } = useSettings();

  if (dashLoading || !dashboard) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size="lg" label="Loading dashboard metrics..." />
      </div>
    );
  }

  const uncontactedRecruiters = contacts.filter(
    (c) => c.status === 'New' && !c.do_not_email
  );

  return (
    <div className="space-y-6">
      {/* Setup Incomplete Banner if needed */}
      {!isSetupComplete && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-semibold text-white">Complete your sender configuration:</span> Add your
              Google Drive resume link and sender name to start outreach.
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/settings')}
            className="shrink-0"
          >
            Configure Settings &rarr;
          </Button>
        </div>
      )}

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL RECRUITERS"
          value={dashboard.stats.totalContacts}
          subtitle={`${uncontactedRecruiters.length} ready to contact`}
          icon={<Users className="w-4 h-4" />}
        />

        <StatCard
          title="DISPATCHED TODAY"
          value={sentToday}
          subtitle={`${remainingToday} remaining in quota`}
          icon={<Send className="w-4 h-4" />}
          trend={{
            value: `${dailyLimit - remainingToday}/${dailyLimit}`,
            isPositive: percentUsed < 90,
          }}
        />

        <StatCard
          title="REPLY RATE"
          value={`${dashboard.stats.replyRate}%`}
          subtitle={`${dashboard.stats.totalReplies} responses tracked`}
          icon={<MessageSquare className="w-4 h-4" />}
          trend={{
            value: '+4.2% vs avg',
            isPositive: true,
          }}
        />

        <StatCard
          title="FOLLOW-UPS DUE"
          value={dashboard.stats.followUpsDueToday}
          subtitle="Awaiting response"
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Daily Quota & Quick Outreach row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <DailyLimitBar
            sentToday={sentToday}
            dailyLimit={dailyLimit}
            percentUsed={percentUsed}
            remainingToday={remainingToday}
          />
        </div>
        <div>
          <QuickSendCard
            uncontactedRecruiters={uncontactedRecruiters}
            defaultTemplate={defaultTemplate}
            remainingDailyLimit={remainingToday}
          />
        </div>
      </div>

      {/* Follow-Up Action Center */}
      <FollowUpSection
        contacts={contacts}
        onMarkReplied={markReplied}
        onSnooze={snoozeFollowUp}
      />

      {/* Recent Activity Feed & Action Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RecentActivityList logs={dashboard.recentLogs} />
        </div>

        <div className="space-y-3">
          <div className="bg-[#0c0c0c] border border-white/5 rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-tight">Quick Navigation</h4>
            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full justify-start text-xs"
                leftIcon={<Send className="w-4 h-4 text-emerald-950" />}
                onClick={() => navigate('/send')}
              >
                Send Cold Email Campaign
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
                leftIcon={<BarChart2 className="w-4 h-4 text-emerald-400" />}
                onClick={() => navigate('/analytics')}
              >
                Outreach Performance Analytics
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
                leftIcon={<Settings className="w-4 h-4 text-emerald-400" />}
                onClick={() => navigate('/settings')}
              >
                Account & Delivery Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
                leftIcon={<UploadCloud className="w-4 h-4 text-zinc-400" />}
                onClick={() => navigate('/upload')}
              >
                Import Contacts from CSV / PDF
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
                leftIcon={<FileText className="w-4 h-4 text-zinc-400" />}
                onClick={() => navigate('/templates')}
              >
                Manage Email Templates ({templates.length})
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-xs"
                leftIcon={<Users className="w-4 h-4 text-zinc-400" />}
                onClick={() => navigate('/contacts')}
              >
                View Contacts Directory ({contacts.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
