import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Lock,
  User,
  Heart,
  Home,
  CalendarDays,
  PlusCircle,
  History,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const AppHeader: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/app/dashboard', icon: Home },
    { label: 'Calendar', path: '/app/calendar', icon: CalendarDays },
    { label: 'Track', path: '/app/track', icon: PlusCircle },
    { label: 'History', path: '/app/history', icon: History },
    { label: 'More', path: '/app/more', icon: MoreHorizontal },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link to="/app/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
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
                    ? 'bg-white text-rose-700 shadow-soft font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-rose-500' : 'text-slate-400')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Privacy Indicator & More/Profile */}
        <div className="flex items-center gap-2.5">
          {/* Privacy Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Lock className="w-3 h-3" />
            <span>Private</span>
          </div>

          {/* More/Profile Link */}
          <Link
            to="/app/more"
            aria-label="Profile and Settings"
            className={cn(
              'p-2 rounded-xl transition-all duration-150 flex items-center justify-center',
              location.pathname === '/app/more' || location.pathname === '/app/profile'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
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
