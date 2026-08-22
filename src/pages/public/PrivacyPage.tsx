import React from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ShieldCheck, Lock, EyeOff, Database, Trash2, Heart } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
      <PageHeader
        title="Privacy Policy"
        subtitle="Last updated: August 2026. Your reproductive health data belongs to you."
      />

      {/* Core Privacy Promise */}
      <Card className="p-6 bg-gradient-to-br from-blush-50/70 via-white to-sage-50/50 border border-blush-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blush-100 rounded-xl text-blush-700 shrink-0 mt-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Our Absolute Privacy Commitment</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Aura is built on a strict privacy-first foundation. We do not sell, monetize, broker, or share your personal health data with third parties, ad networks, or data brokers.
            </p>
          </div>
        </div>
      </Card>

      {/* Sections */}
      <div className="space-y-6 text-sm text-slate-700">
        <Card className="p-6 space-y-3 bg-white border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <EyeOff className="w-5 h-5 text-blush-500" />
            <h3>1. What Information We Collect</h3>
          </div>
          <p>We only collect information strictly necessary to provide the menstrual tracking service:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Account Details:</strong> Email address and encrypted password credentials managed securely via Supabase Auth.</li>
            <li><strong>Health &amp; Cycle Data:</strong> Period start dates, optional end dates, recorded cycle lengths, logged symptoms, and personal notes you choose to enter.</li>
            <li><strong>Preferences:</strong> Notification reminder settings (days before, time) stored in your personal vault.</li>
          </ul>
          <p className="text-xs text-slate-500 pt-1">
            We do NOT collect phone numbers, real physical addresses, contact lists, GPS locations, or unnecessary biometric data.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Lock className="w-5 h-5 text-sage-600" />
            <h3>2. How Your Data Is Secured</h3>
          </div>
          <p>
            All network communication takes place over encrypted HTTPS (TLS 1.3). Database access is enforced via strict PostgreSQL <strong>Row-Level Security (RLS)</strong> policies, ensuring that no user can ever query or modify another user's records.
          </p>
          <p className="text-slate-600">
            Cycle calculations, statistics, and pattern evaluations are computed deterministically without sending your data to external AI models or third-party analytics engines.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Database className="w-5 h-5 text-lavender-600" />
            <h3>3. Cookies and Local Storage</h3>
          </div>
          <p className="text-slate-600">
            We use browser storage (localStorage and secure session tokens) solely for maintaining your authenticated session and caching application shell assets for offline PWA operation. We do not use third-party tracking cookies or advertising pixels.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Trash2 className="w-5 h-5 text-rose-500" />
            <h3>4. Your Rights and Data Deletion</h3>
          </div>
          <p className="text-slate-600">
            You maintain full sovereignty over your data. You may edit or delete individual cycle logs and symptom records at any time. When you request account deletion, all associated records (cycles, symptoms, reminders, and profile) are permanently removed.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Heart className="w-5 h-5 text-blush-500" />
            <h3>5. Not Medical Advice</h3>
          </div>
          <p className="text-slate-600">
            Aura is a personal health tracking utility. The cycle estimates and insights provided are informational calculations based on your historical records and do not constitute professional medical advice, diagnosis, or clinical contraception.
          </p>
        </Card>
      </div>
    </div>
  );
};
