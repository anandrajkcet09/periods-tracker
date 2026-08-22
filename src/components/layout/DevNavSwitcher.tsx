import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';

export const DevNavSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const publicRoutes = [
    { label: 'Landing', path: '/' },
    { label: 'Login', path: '/login' },
    { label: 'Signup', path: '/signup' },
    { label: 'Verify Email', path: '/verify-email' },
    { label: 'Forgot Password', path: '/forgot-password' },
    { label: 'Reset Password', path: '/reset-password' },
  ];

  const appRoutes = [
    { label: 'Dashboard', path: '/app/dashboard' },
    { label: 'Calendar', path: '/app/calendar' },
    { label: 'Track Period', path: '/app/track' },
    { label: 'History', path: '/app/history' },
    { label: 'Insights', path: '/app/insights' },
    { label: 'Profile', path: '/app/profile' },
  ];

  return (
    <div className="bg-slate-900 text-slate-200 text-xs z-50 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-blush-400" />
          <span className="font-semibold text-slate-300">Route Switcher</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            Foundation Preview
          </span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-slate-300 hover:text-white font-medium px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
        >
          <span>{isOpen ? 'Hide Quick Links' : 'Browse All 12 Routes'}</span>
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-800/80 bg-slate-950/90 px-4 py-3 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <div>
            <span className="block text-[11px] font-semibold text-blush-300 uppercase tracking-wider mb-2">
              Public Routes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {publicRoutes.map((r) => (
                <NavLink
                  key={r.path}
                  to={r.path}
                  className={({ isActive }) =>
                    cn(
                      'px-2.5 py-1 rounded-md text-xs transition-colors',
                      isActive
                        ? 'bg-blush-500 text-white font-semibold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    )
                  }
                >
                  {r.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-semibold text-sage-300 uppercase tracking-wider mb-2">
              Authenticated App Routes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {appRoutes.map((r) => (
                <NavLink
                  key={r.path}
                  to={r.path}
                  className={({ isActive }) =>
                    cn(
                      'px-2.5 py-1 rounded-md text-xs transition-colors',
                      isActive
                        ? 'bg-sage-600 text-white font-semibold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    )
                  }
                >
                  {r.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
