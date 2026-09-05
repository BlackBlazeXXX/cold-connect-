// FILE: src/components/layout/MobileNav.tsx
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
} from 'lucide-react';

const mobileNavItems = [
  { label: 'Dash', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Upload', path: '/upload', icon: <Upload className="w-4 h-4" /> },
  { label: 'Contacts', path: '/contacts', icon: <Users className="w-4 h-4" /> },
  { label: 'Templates', path: '/templates', icon: <FileText className="w-4 h-4" /> },
  { label: 'Send', path: '/send', icon: <Send className="w-4 h-4" /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChart2 className="w-4 h-4" /> },
  { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
];

export const MobileNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5 px-2 py-1.5 flex items-center justify-between sm:justify-around overflow-x-auto gap-1 select-none">
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => {
            const isDashboardActive =
              (item.path === '/dashboard' && window.location.hash.replace('#', '') === '/') ||
              isActive;
            return `flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors shrink-0 min-w-[46px] ${
              isDashboardActive
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/20'
                : 'text-zinc-500 hover:text-zinc-200'
            }`;
          }}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
