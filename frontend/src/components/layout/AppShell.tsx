// FILE: src/components/layout/AppShell.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-[#a1a1aa] flex font-sans selection:bg-emerald-500/30 selection:text-white">
      {/* Desktop Sidebar (240px) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-60 min-w-0 pb-20 md:pb-8">
        <Header />
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};
