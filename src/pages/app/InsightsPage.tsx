import React from 'react';
import { Sparkles, TrendingUp, FileDown, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';

export const InsightsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Cycle Insights"
        subtitle="Mathematical patterns and symptom correlations derived purely on your device."
        action={
          <Button size="sm" variant="outline" leftIcon={<FileDown className="w-4 h-4" />}>
            Export PDF for Doctor
          </Button>
        }
      />

      {/* Cycle Regularity Overview */}
      <Card className="p-6 bg-gradient-to-br from-sage-50/80 via-white to-blush-50/50 border border-sage-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sage-600" />
              <h2 className="text-lg font-bold text-slate-900">Highly Regular Rhythm</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Your cycle length varies by less than ±1 day across your last 4 tracked cycles.
              Ovulation is consistently occurring between day 13 and day 15.
            </p>
          </div>
          <div className="text-right sm:text-right shrink-0">
            <Badge variant="sage" size="md">
              98% Predictability
            </Badge>
          </div>
        </div>
      </Card>

      {/* Phase Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="outline" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Menstrual & Follicular Phase</h3>
            <Badge variant="blush" size="sm">
              Days 1–13
            </Badge>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Energy tends to rise after day 4 as estrogen gradually increases. Light cramps typically resolve by day 3.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Avg Period Duration:</span>
            <strong className="text-slate-800 font-semibold">5 Days</strong>
          </div>
        </Card>

        <Card variant="outline" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Luteal Phase</h3>
            <Badge variant="sage" size="sm">
              Days 15–28
            </Badge>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Progesterone peaks around day 21. Mild cravings and fatigue are commonly reported during days 24–27.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Avg Luteal Length:</span>
            <strong className="text-slate-800 font-semibold">14 Days</strong>
          </div>
        </Card>
      </div>

      {/* Frequent Symptoms */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Most Frequently Logged Symptoms
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>Mild Pelvic Cramps (Day 1–2)</span>
              <span>85% of cycles</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blush-500 h-full rounded-full" style={{ width: '85%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>High Energy / Peak Mood (Days 10–14)</span>
              <span>75% of cycles</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-sage-500 h-full rounded-full" style={{ width: '75%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>Restless Sleep (Days 26–27)</span>
              <span>40% of cycles</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-lavender-500 h-full rounded-full" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* On-Device Security Badge */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-900">Deterministic On-Device Analytics</p>
          <p>
            All cycle statistics and averages are computed locally with deterministic algorithms.
            No cloud processing or third-party AI analytics are used.
          </p>
        </div>
      </div>
    </div>
  );
};
