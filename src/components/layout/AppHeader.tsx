import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Lock,
  User,
  Heart,
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  History,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const AppHeader: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { label: 'Today', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Calendar', path: '/app/calendar', icon: CalendarDays },
    { label: 'Track Log', path: '/app/track', icon: PlusCircle },
    { label: 'History', path: '/app/history', icon: History },
    { label: 'Insights', path: '/app/insights', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link to="/app/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blush-500 to-blush-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
            <Heart className="w-4 h-4 fill-white/20 stroke-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-base">Aura</span>
        </Link>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white text-blush-700 shadow-soft font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-blush-500' : 'text-slate-400')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Privacy Indicator & Profile */}
        <div className="flex items-center gap-3">
          {/* Privacy Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Lock className="w-3 h-3" />
            <span>Private Vault</span>
          </div>

          {/* Profile Link */}
          <Link
            to="/app/profile"
            aria-label="Profile and Settings"
            className={cn(
              'p-2 rounded-xl transition-all duration-150 flex items-center justify-center',
              location.pathname === '/app/profile'
                ? 'bg-blush-50 text-blush-600 border border-blush-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
