// src/pages/app/SettingsPage.tsx
import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

/**
 * Settings page containing Notifications and Account sections.
 * Notification settings are stored in a `reminders` table in Supabase.
 */
export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [daysBefore, setDaysBefore] = useState(2);
  const [time, setTime] = useState("09:00");
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  // Load reminder settings on mount
  useEffect(() => {
    if (!user) return;
    const fetchReminder = async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("enabled, reminder_days_before, reminder_time")
        .eq("user_id", user.id)
        .single();
      if (error && error.code !== "PGRST116") {
        console.error(error);
        return;
      }
      if (data) {
        setEnabled(data.enabled);
        setDaysBefore(data.reminder_days_before);
        setTime(data.reminder_time?.slice(0, 5) ?? "09:00");
      }
      setLoading(false);
    };
    fetchReminder();
  }, [user]);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const saveSettings = async () => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      enabled,
      reminder_days_before: daysBefore,
      reminder_time: `${time}:00`,
    };
    const { error } = await supabase.from("reminders").upsert(payload, { onConflict: "user_id" });
    if (error) {
      console.error(error);
      alert("Failed to save settings");
    } else {
      alert("Settings saved");
    }
  };

  // Account actions
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account and all data? This action cannot be undone.")) return;
    // Note: Full account deletion requires a server-side endpoint with the service-role key.
    // For now, sign out the user.
    alert("Please contact support to delete your account.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" />

      {/* Notifications Section */}
      <Card className="p-5 bg-white border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Notifications</h2>
        {permission === "denied" && (
          <p className="text-sm text-red-600 mb-2">
            Notification permission was denied. The app cannot send reminders.
          </p>
        )}
        {permission !== "granted" && (
          <Button onClick={requestPermission} className="mb-4" size="sm">
            Request Notification Permission
          </Button>
        )}
        <div className="flex items-center space-x-3 mb-4">
          <input
            id="reminder-enabled"
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            disabled={permission !== "granted"}
            className="h-4 w-4 rounded border-slate-300 text-blush-600 focus:ring-blush-500"
          />
          <label htmlFor="reminder-enabled" className="text-sm text-slate-700 select-none">
            Enable reminder
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Days before period</label>
            <select
              value={daysBefore.toString()}
              onChange={(e) => setDaysBefore(parseInt(e.target.value, 10))}
              disabled={!enabled}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blush-500 disabled:opacity-50"
            >
              {[1, 2, 3, 5, 7].map((d) => (
                <option key={d} value={d}>
                  {d} day{d > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reminder time</label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={!enabled} />
          </div>
        </div>
        <Button onClick={saveSettings} className="mt-4" disabled={loading} size="sm">
          Save Notification Settings
        </Button>
      </Card>

      {/* Account Section */}
      <Card className="p-5 bg-white border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Account</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
          <Button onClick={handleDeleteAccount} variant="danger">
            Delete Account &amp; Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
