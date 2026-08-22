import React from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { FileText, AlertCircle, ShieldAlert, Sparkles, Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fade-in">
      <PageHeader
        title="Terms of Service"
        subtitle="Last updated: August 2026. Clear, transparent terms for using Aura."
      />

      <Card className="p-6 bg-gradient-to-br from-slate-50 via-white to-blush-50/40 border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 shrink-0 mt-1">
            <Scale className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Agreement Overview</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              By accessing or using Aura, you agree to be bound by these Terms. Aura is dedicated to providing private, reliable personal menstrual tracking.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-6 text-sm text-slate-700">
        <Card className="p-6 space-y-3 bg-white border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3>1. Medical Disclaimer (Important)</h3>
          </div>
          <p className="text-slate-600">
            Aura is NOT a medical device, medical service, or diagnostic platform. The software provides deterministic statistical tracking and mathematical cycle projections based solely on the historical data you input.
          </p>
          <p className="font-semibold text-slate-800">
            Do not use Aura as a form of contraception or birth control, or as a substitute for professional clinical medical advice, diagnosis, or treatment.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileText className="w-5 h-5 text-blush-500" />
            <h3>2. User Account and Responsibilities</h3>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to provide accurate email credentials to ensure secure password recovery.</li>
            <li>You agree not to attempt unauthorized access to the database or disrupt the service infrastructure.</li>
          </ul>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Sparkles className="w-5 h-5 text-sage-600" />
            <h3>3. Service Availability and Modifications</h3>
          </div>
          <p className="text-slate-600">
            We strive for 100% uptime with offline PWA support. However, cloud synchronization depends on standard internet connectivity and Supabase infrastructure. We reserve the right to improve or update features in accordance with our user-first privacy standards.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3>4. Limitation of Liability</h3>
          </div>
          <p className="text-slate-600">
            To the maximum extent permitted by applicable law, Aura and its developers shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the tracking tools or health estimations.
          </p>
        </Card>
      </div>
    </div>
  );
};
