import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { InstallPrompt } from '@/components/InstallPrompt';
import { OfflineBanner } from '@/components/OfflineBanner';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-8">
      <OfflineBanner />
      <AppHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 pb-8">
        <Outlet />
      </main>

      <BottomNav />
      <InstallPrompt />
    </div>
  );
};

export { AppLayout };
