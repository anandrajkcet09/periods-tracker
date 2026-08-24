import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronRight,
  Heart,
  Lock,
  Calendar,
  History,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useCycles } from '@/context/CycleContext';
import { supabase } from '@/lib/supabase';

export const MorePage: React.FC = () => {
  const { user } = useAuth();
  const { cycles } = useCycles();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  const navSections = [
    {
      title: 'Analytics & Insights',
      items: [
        {
          label: 'Cycle Insights & Trends',
          description: 'Averages, cycle regularity, and symptom distribution',
          path: '/app/insights',
          icon: Sparkles,
          color: 'text-purple-600 bg-purple-50',
        },
      ],
    },
    {
      title: 'Preferences & Settings',
      items: [
        {
          label: 'Reminders & Notifications',
          description: 'Custom alerts before your estimated period start',
          path: '/app/settings',
          icon: SettingsIcon,
          color: 'text-blush-600 bg-rose-50',
        },
        {
          label: 'Profile & Account Security',
          description: 'Manage your username and password',
          path: '/app/profile',
          icon: User,
          color: 'text-sky-600 bg-sky-50',
        },
      ],
    },
    {
      title: 'Privacy & Legal',
      items: [
        {
          label: 'Privacy Policy',
          description: 'Zero third-party tracking and encrypted storage guarantees',
          path: '/privacy',
          icon: ShieldCheck,
          color: 'text-emerald-600 bg-emerald-50',
        },
        {
          label: 'Terms of Service',
          description: 'Service guidelines and medical disclaimer',
          path: '/terms',
          icon: FileText,
          color: 'text-slate-600 bg-slate-100',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <PageHeader
        title="More"
        subtitle="Manage settings, review insights, and customize your private vault."
      />

      {/* User Profile Overview Card */}
      <Card className="p-5 bg-gradient-to-br from-rose-50/70 via-white to-sky-50/40 border border-rose-100/80">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-soft">
            {user?.email ? user.email.charAt(0).toUpperCase() : <Heart className="w-6 h-6 fill-white/20" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-900 truncate">
              {user?.user_metadata?.username || 'Private User'}
            </h2>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Lock className="w-2.5 h-2.5" />
                RLS Encrypted
              </span>
              <span className="text-[11px] text-slate-500">
                {cycles.length} {cycles.length === 1 ? 'cycle' : 'cycles'} saved
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Sections */}
      {navSections.map((section, idx) => (
        <div key={idx} className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            {section.title}
          </h3>
          <Card className="divide-y divide-slate-100 p-0 overflow-hidden bg-white border border-slate-100 shadow-soft">
            {section.items.map((item, itemIdx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={itemIdx}
                  to={item.path}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl ${item.color} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-rose-600 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors shrink-0" />
                </Link>
              );
            })}
          </Card>
        </div>
      ))}

      {/* Quick Shortcuts */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Quick Shortcuts
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/app/calendar">
            <Card className="p-3.5 flex items-center gap-2.5 hover:bg-slate-50 bg-white border border-slate-100 transition-colors">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-slate-800">Cycle Calendar</span>
            </Card>
          </Link>
          <Link to="/app/history">
            <Card className="p-3.5 flex items-center gap-2.5 hover:bg-slate-50 bg-white border border-slate-100 transition-colors">
              <History className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-slate-800">Log History</span>
            </Card>
          </Link>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <Button
          variant="outline"
          fullWidth
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4 text-slate-600" />}
          className="border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
        >
          Sign Out of Aura
        </Button>
      </div>
    </div>
  );
};
