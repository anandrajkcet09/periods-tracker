import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Bell, Check, Loader2, LogOut, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [daysBefore, setDaysBefore] = useState(2);
  const [time, setTime] = useState('09:00');
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Load reminder settings on mount
  useEffect(() => {
    if (!user) return;
    const fetchReminder = async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('enabled, reminder_days_before, reminder_time')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error(error);
        return;
      }
      if (data) {
        setEnabled(data.enabled);
        setDaysBefore(data.reminder_days_before);
        setTime(data.reminder_time?.slice(0, 5) ?? '09:00');
      }
      setLoading(false);
    };
    fetchReminder();
  }, [user]);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const saveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    const payload = {
      user_id: user.id,
      enabled,
      reminder_days_before: daysBefore,
      reminder_time: `${time}:00`,
    };
    const { error } = await supabase.from('reminders').upsert(payload, { onConflict: 'user_id' });
    setIsSaving(false);
    if (error) {
      console.error(error);
    } else {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <PageHeader
        title="Notifications &amp; Reminders"
        subtitle="Configure local notification preferences ahead of your estimated period."
        showBack
        backUrl="/app/more"
      />

      {/* Notifications Card */}
      <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Period Reminders
          </h2>
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            Notification permissions are currently denied in your browser settings.
          </div>
        )}

        {permission !== 'granted' && (
          <Button onClick={requestPermission} size="sm" variant="secondary">
            Enable Browser Notification Permissions
          </Button>
        )}

        <div className="flex items-center space-x-3 pt-1">
          <input
            id="reminder-enabled"
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            disabled={permission !== 'granted'}
            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
          />
          <label htmlFor="reminder-enabled" className="text-sm font-medium text-slate-800 select-none cursor-pointer">
            Send reminder before estimated period start
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Days Before Estimated Period
            </label>
            <select
              value={daysBefore.toString()}
              onChange={(e) => setDaysBefore(parseInt(e.target.value, 10))}
              disabled={!enabled}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
            >
              {[1, 2, 3, 5, 7].map((d) => (
                <option key={d} value={d}>
                  {d} day{d > 1 ? 's' : ''} prior
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Notification Time
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!enabled}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={saveSettings}
            disabled={loading || isSaving}
            size="md"
            variant="primary"
            leftIcon={
              savedSuccess ? (
                <Check className="w-4 h-4 text-white" />
              ) : isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : undefined
            }
          >
            {savedSuccess ? 'Settings Saved!' : isSaving ? 'Saving...' : 'Save Notification Preferences'}
          </Button>
        </div>
      </Card>

      {/* Account Section */}
      <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldAlert className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Session &amp; Account
          </h2>
        </div>

        <p className="text-xs text-slate-600">
          Sign out of your account on this device. Your data remains encrypted in Supabase.
        </p>

        <div className="pt-1">
          <Button onClick={handleLogout} variant="outline" size="sm" leftIcon={<LogOut className="w-4 h-4" />}>
            Log Out of Aura
          </Button>
        </div>
      </Card>
    </div>
  );
};
