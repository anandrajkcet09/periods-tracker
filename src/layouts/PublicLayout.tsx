import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { DevNavSwitcher } from '@/components/layout/DevNavSwitcher';
import { ShieldCheck, Heart, Lock } from 'lucide-react';

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

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Tracker Architecture</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Lock className="w-3.5 h-3.5" />
              <span>Encrypted Storage</span>
            </div>
            <Link to="/app/dashboard" className="text-blush-600 hover:underline">
              Launch App →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
