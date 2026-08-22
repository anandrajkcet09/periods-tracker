import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { DevNavSwitcher } from '@/components/layout/DevNavSwitcher';
import { Heart } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blush-50/50 via-white to-slate-50">
      <DevNavSwitcher />
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-slate-100 bg-white/70 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-blush-500 fill-blush-500/20" />
            <span className="font-semibold text-slate-700">Aura</span>
            <span>— Privacy-First Period Tracker</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link to="/privacy" className="text-slate-600 hover:text-blush-600 hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-slate-600 hover:text-blush-600 hover:underline">
              Terms of Service
            </Link>
            <Link to="/app/dashboard" className="text-blush-600 font-medium hover:underline">
              Launch App →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
