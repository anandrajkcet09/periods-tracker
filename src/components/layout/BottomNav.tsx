import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  History,
  Sparkles,
  Settings,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const BottomNav: React.FC = () => {
  const navItems = [
    {
      label: 'Today',
      path: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Calendar',
      path: '/app/calendar',
      icon: CalendarDays,
    },
    {
      label: 'Track',
      path: '/app/track',
      icon: PlusCircle,
      highlight: true,
    },
    {
      label: 'History',
      path: '/app/history',
      icon: History,
    },
    {
      label: 'Insights',
      path: '/app/insights',
      icon: Sparkles,
    },
    {
      label: 'Settings',
      path: '/app/settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-100/90 pb-safe md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 relative select-none',
                  isActive ? 'text-blush-600 font-semibold' : 'text-slate-600 hover:text-slate-900',
                  item.highlight && '-mt-3'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.highlight ? (
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95',
                        isActive
                          ? 'bg-blush-600 text-white shadow-glow-pink scale-105'
                          : 'bg-blush-500 text-white hover:bg-blush-600'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Icon
                        className={cn(
                          'w-5 h-5 transition-transform',
                          isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'
                        )}
                      />
                      <span className="text-[10px] mt-1 tracking-tight">
                        {item.label}
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
