// FILE: src/pages/AnalyticsPage.tsx
import React from 'react';
import { Users, Send, MessageSquare, Award } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { StatCard } from '../components/ui/StatCard';
import { FunnelChart } from '../components/analytics/FunnelChart';
import { DailyVolumeChart } from '../components/analytics/DailyVolumeChart';
import { TopCompaniesTable } from '../components/analytics/TopCompaniesTable';
import { TemplatePerformance } from '../components/analytics/TemplatePerformance';
import { Spinner } from '../components/ui/Spinner';

export const AnalyticsPage: React.FC = () => {
  const { data: analytics, loading } = useAnalytics();

  if (loading || !analytics) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Spinner size="lg" label="Computing outreach performance..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL RECRUITERS"
          value={analytics.totalContacts}
          subtitle="Contacts across all sources"
          icon={<Users className="w-4 h-4" />}
        />

        <StatCard
          title="EMAILS DISPATCHED"
          value={analytics.totalSent}
          subtitle="Outreach and follow-ups"
          icon={<Send className="w-4 h-4" />}
        />

        <StatCard
          title="REPLIES RECEIVED"
          value={analytics.totalReplied}
          subtitle={`${analytics.replyRate}% conversion rate`}
          icon={<MessageSquare className="w-4 h-4" />}
          trend={{
            value: `${analytics.replyRate}%`,
            isPositive: analytics.replyRate >= 15,
          }}
        />

        <StatCard
          title="INTERVIEW RESPONSES"
          value={analytics.positiveReplies}
          subtitle="High-intent recruiter chats"
          icon={<Award className="w-4 h-4" />}
        />
      </div>

      {/* Visual Analytics: Funnel & Daily Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelChart
          totalContacts={analytics.totalContacts}
          emailsSent={analytics.totalSent}
          repliesReceived={analytics.totalReplied}
          positiveReplies={analytics.positiveReplies}
        />

        <DailyVolumeChart data={analytics.dailyVolume} />
      </div>

      {/* Tables: Top Companies & Template Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCompaniesTable companies={analytics.topCompanies} />
        <TemplatePerformance metrics={analytics.templateMetrics} />
      </div>
    </div>
  );
};
