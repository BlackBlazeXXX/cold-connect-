// FILE: src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Users,
  FileText,
  Send,
  BarChart2,
  Settings,
  LogOut,
  Mail,
  Zap,
} from 'lucide-react';
import { APP_CONFIG } from '../../constants/constants';
import { useAuth } from '../../hooks/useAuth';
import { useDailyLimit } from '../../hooks/useDailyLimit';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Upload: <Upload className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Send: <Send className="w-4 h-4" />,
  BarChart2: <BarChart2 className="w-4 h-4" />,
  Settings: <Settings className="w-4 h-4" />,
};

const navItems = [
  { label: 'Dashboard', path: '/dashboard', iconKey: 'LayoutDashboard' },
  { label: 'Upload', path: '/upload', iconKey: 'Upload' },
  { label: 'Contacts', path: '/contacts', iconKey: 'Users' },
  { label: 'Templates', path: '/templates', iconKey: 'FileText' },
  { label: 'Send Email', path: '/send', iconKey: 'Send' },
  { label: 'Analytics', path: '/analytics', iconKey: 'BarChart2' },
  { label: 'Settings', path: '/settings', iconKey: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { sentToday, dailyLimit, percentUsed } = useDailyLimit();

  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 bg-[#0a0a0a] text-[#a1a1aa] border-r border-white/5 z-30 select-none">
      {/* Brand Header */}
      <div className="px-4 py-3.5 border-b border-white/5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shadow-sm shrink-0">
          <Mail className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xs font-semibold tracking-tight text-white flex items-center gap-1.5">
            {APP_CONFIG.name}
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-mono">
              v{APP_CONFIG.version}
            </span>
          </h1>
          <p className="text-[10px] text-zinc-500 truncate">
            {APP_CONFIG.tagline}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => {
              // Also highlight Dashboard when on root '/'
              const isDashboardActive = (item.path === '/dashboard' && window.location.hash.replace('#', '') === '/') || isActive;
              return `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                isDashboardActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`;
            }}
          >
            <span className="flex items-center shrink-0">{iconMap[item.iconKey]}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Daily Send Status Widget */}
      <div className="px-3 py-2.5 mx-2.5 mb-2 bg-[#0c0c0c] rounded-xl border border-white/5">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-zinc-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Daily Quota
          </span>
          <span className="font-mono text-[11px] text-white">
            {sentToday}/{dailyLimit}
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              percentUsed > 90
                ? 'bg-rose-500'
                : percentUsed > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>
      </div>

      {/* User Footer */}
      <div className="px-3 py-2.5 border-t border-white/5 flex items-center justify-between bg-[#0a0a0a]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 text-white font-medium text-xs flex items-center justify-center shrink-0">
            {userInitial.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {user?.user_metadata?.full_name || 'Sanju Designer'}
            </p>
            <p className="text-[10px] text-zinc-500 truncate font-mono">
              {user?.email || 'sanju.designer001@gmail.com'}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
