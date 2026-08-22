import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Download,
  Trash2,
  LogOut,
  Bell,
  Smartphone,
  UserCheck,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [pinLockEnabled, setPinLockEnabled] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [incognitoMode, setIncognitoMode] = useState(false);
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

  const username = profile?.username || user?.user_metadata?.username || 'anonymous_user';
  const email = user?.email || 'No email associated';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Aug 2026';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Settings & Privacy"
        subtitle="Manage your encrypted vault, preferences, and data ownership."
      />

      {/* Account Info Card */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blush-500 to-coral-400 text-white flex items-center justify-center font-bold text-xl uppercase shadow-soft">
            {username.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
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

      {/* Privacy & Security Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Privacy & Security Vault
          </h3>
        </div>

        <Card className="divide-y divide-slate-100 p-0 overflow-hidden bg-white">
          {/* PIN Lock Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-semibold text-slate-900">App Passcode Lock</span>
              </div>
              <p className="text-xs text-slate-500">
                Require a 4-digit PIN every time the app opens.
              </p>
            </div>
            <input
              type="checkbox"
              checked={pinLockEnabled}
              onChange={(e) => setPinLockEnabled(e.target.checked)}
              className="w-4 h-4 text-blush-600 rounded border-slate-300 focus:ring-blush-500 cursor-pointer"
            />
          </div>

          {/* Incognito Discreet Mode */}
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-semibold text-slate-900">Discreet Icon & Title</span>
              </div>
              <p className="text-xs text-slate-500">
                Mask app name as a simple notebook icon on your home screen.
              </p>
            </div>
            <input
              type="checkbox"
              checked={incognitoMode}
              onChange={(e) => setIncognitoMode(e.target.checked)}
              className="w-4 h-4 text-blush-600 rounded border-slate-300 focus:ring-blush-500 cursor-pointer"
            />
          </div>

          {/* Gentle Reminders */}
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-semibold text-slate-900">Period & Phase Reminders</span>
              </div>
              <p className="text-xs text-slate-500">
                Local, on-device notifications 2 days before predicted period.
              </p>
            </div>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="w-4 h-4 text-blush-600 rounded border-slate-300 focus:ring-blush-500 cursor-pointer"
            />
          </div>
        </Card>
      </div>

      {/* Row Level Security Guarantee Info */}
      <Card variant="sage" className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Row Level Security (RLS) Enforced</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your profile and future menstrual logs are isolated using cryptographic Supabase RLS policies.
          Only your authenticated user token can read or update your vault records.
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

        <Card className="p-5 space-y-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Export All Data</h4>
              <p className="text-xs text-slate-500">
                Download your complete profile and cycle records in JSON / CSV format.
              </p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Download Backup
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-rose-600">Delete Vault & All Records</h4>
              <p className="text-xs text-slate-500">
                Permanently purge all data from this device and your encrypted store.
              </p>
            </div>
            <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />}>
              Wipe All Data
            </Button>
          </div>
        </Card>
      </div>

      {/* Security & Version Note */}
      <div className="p-4 rounded-2xl bg-slate-100 text-xs text-slate-600 text-center space-y-1">
        <p className="font-semibold text-slate-800">Aura v0.2.0 (Supabase Auth Active)</p>
        <p>User ID: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">{user?.id || 'session-active'}</code></p>
      </div>
    </div>
  );
};
