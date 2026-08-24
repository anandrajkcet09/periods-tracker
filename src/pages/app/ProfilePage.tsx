import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  LogOut,
  UserCheck,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useCycles } from '@/context/CycleContext';
import { useSymptoms } from '@/context/SymptomContext';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { cycles } = useCycles();
  const { symptoms } = useSymptoms();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch {
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user?.id,
        email: user?.email,
        username: profile?.username || user?.user_metadata?.username,
      },
      cycles,
      symptoms,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-period-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const username = profile?.username || user?.user_metadata?.username || 'Private User';
  const email = user?.email || 'No email associated';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Aug 2026';

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <PageHeader
        title="Profile &amp; Vault Security"
        subtitle="Manage your encrypted profile, data sovereignty, and security settings."
        showBack
        backUrl="/app/more"
      />

      {/* Account Info Card */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-coral-400 text-white flex items-center justify-center font-bold text-xl uppercase shadow-soft">
            {username.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                @{username}
              </h3>
              <Badge variant="sage" size="sm">
                Encrypted Vault
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{email}</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" /> Member since {memberSince}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          leftIcon={isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        >
          {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </Card>

      {/* Row Level Security Guarantee Info */}
      <Card className="p-5 space-y-2 bg-emerald-50/60 border border-emerald-100">
        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Row Level Security (RLS) Cryptographically Enforced</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your profile, period dates, symptoms, and reminders are isolated using PostgreSQL RLS policies in Supabase.
          Only your authenticated JWT session can read or modify your records.
        </p>
      </Card>

      {/* Data Ownership & Export */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Data Sovereignty
          </h3>
        </div>

        <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Export All Data</h4>
              <p className="text-xs text-slate-500">
                Download your entire history (cycles, durations, notes, and symptoms) in JSON format.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export JSON Backup
            </Button>
          </div>
        </Card>
      </div>

      {/* Security & Version Note */}
      <div className="p-4 rounded-2xl bg-slate-100 text-xs text-slate-600 text-center space-y-1">
        <p className="font-semibold text-slate-800">Aura v1.0 • Privacy-First PWA</p>
        <p>Authenticated Session: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-[11px] font-mono">{user?.id?.slice(0, 16)}...</code></p>
      </div>
    </div>
  );
};
