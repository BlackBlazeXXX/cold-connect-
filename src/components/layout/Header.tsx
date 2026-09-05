// FILE: src/components/layout/Header.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSettings } from '../../hooks/useSettings';
import { format } from 'date-fns';

const PAGE_METADATA: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Outreach Dashboard',
    subtitle: 'Track your daily send quota, responses, and overdue follow-ups.',
  },
  '/upload': {
    title: 'Import HR Contacts',
    subtitle: 'Upload CSV or structured PDF lists to extract and verify recruiters.',
  },
  '/contacts': {
    title: 'Contacts Directory',
    subtitle: 'Manage hiring managers, conversation logs, and block lists.',
  },
  '/templates': {
    title: 'Email Templates',
    subtitle: 'Draft personalized cold email copy with merge tags and AI review.',
  },
  '/send': {
    title: 'Send Campaign',
    subtitle: 'Personalize subjects with AI, review merge preview, and dispatch outreach.',
  },
  '/analytics': {
    title: 'Performance Analytics',
    subtitle: 'Analyze reply rates, top responsive companies, and template metrics.',
  },
  '/settings': {
    title: 'Account Settings',
    subtitle: 'Configure Resend email sender, Google Drive resume, and Claude AI.',
  },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSetupComplete } = useSettings();

  const currentMeta = PAGE_METADATA[location.pathname] || {
    title: 'Cold Connect',
    subtitle: 'Smart cold outreach for job seekers',
  };

  const todayFormatted = format(new Date(), 'MMM d, yyyy');

  return (
    <header className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
      <div>
        <div className="flex items-baseline gap-3">
          <h2 className="text-base md:text-lg font-medium text-white tracking-tight">
            {currentMeta.title}
          </h2>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold font-mono">
            {location.pathname.replace('/', '') || 'DASHBOARD'}
          </span>
        </div>
        <p className="text-xs text-zinc-400 hidden md:block mt-0.5">{currentMeta.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* System Online Badge from Elegant Dark design */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-mono">System Online</span>
        </div>

        {/* Date / Time badge */}
        <div className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono hidden md:block">
          {todayFormatted}
        </div>

        {!isSetupComplete ? (
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Setup Required</span>
            <span className="sm:hidden">Setup</span>
          </button>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready</span>
          </div>
        )}

        {location.pathname !== '/send' && (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Send className="w-3.5 h-3.5" />}
            onClick={() => navigate('/send')}
          >
            Send Email
          </Button>
        )}
      </div>
    </header>
  );
};
