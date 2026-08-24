import React from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ShieldCheck, Sparkles, Activity, Calendar } from 'lucide-react';
import { useCycles } from '@/context/CycleContext';
import { useSymptoms } from '@/context/SymptomContext';
import { formatDateDisplay } from '@/utils/cycleCalculations';

export const InsightsPage: React.FC = () => {
  const { cycles, loading: cyclesLoading } = useCycles();
  const { symptoms, loading: symptomsLoading } = useSymptoms();

  // Helper to format days
  const formatDays = (num: number | null | undefined) => (num ? `${num} Days` : '—');

  // Cycle statistics calculations
  const cycleLengths = cycles
    .map((c) => c.cycle_length)
    .filter((l): l is number => typeof l === 'number' && l > 0);
  const periodDurations = cycles
    .map((c) => c.period_duration)
    .filter((d): d is number => typeof d === 'number' && d > 0);

  const avgCycleLength =
    cycleLengths.length >= 2
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : null;
  const avgPeriodDuration =
    periodDurations.length >= 2
      ? Math.round(periodDurations.reduce((a, b) => a + b, 0) / periodDurations.length)
      : null;

  const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : null;
  const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : null;

  const recentLengths = cycles.slice(0, 5).map((c) => ({
    date: c.start_date,
    length: c.cycle_length || 28,
  }));

  const recentDurations = cycles
    .slice(0, 5)
    .filter((c) => c.period_duration)
    .map((c) => ({
      date: c.start_date,
      duration: c.period_duration as number,
    }));

  // Symptom frequency
  const symptomCounts: Record<string, number> = {};
  symptoms.forEach((s) => {
    const key = s.symptom;
    symptomCounts[key] = (symptomCounts[key] || 0) + 1;
  });
  const symptomFrequency = Object.entries(symptomCounts)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count);

  const hasCycleData = cycles.length > 0;
  const hasEnoughCyclesForAvg = cycleLengths.length >= 2;
  const hasEnoughPeriodsForAvg = periodDurations.length >= 2;
  const hasSymptomData = symptoms.length > 0;

  if (cyclesLoading || symptomsLoading) {
    return (
      <div className="space-y-6 animate-fade-in pb-16">
        <PageHeader title="Cycle Insights" subtitle="Loading your personalized tracking analytics..." />
        <Card className="p-8 text-center bg-white border border-slate-100">
          <p className="text-xs text-slate-400">Loading insights...</p>
        </Card>
      </div>
    );
  }

  if (!hasCycleData && !hasSymptomData) {
    return (
      <div className="space-y-6 animate-fade-in pb-16">
        <PageHeader
          title="Cycle Insights"
          subtitle="Mathematical cycle patterns and symptom correlations derived purely on your device."
          showBack
          backUrl="/app/more"
        />
        <Card className="p-8 text-center space-y-3 bg-white border border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800">No Insights Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Record a few periods and log daily symptoms to generate personalized averages, cycle regularity, and symptom distributions.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <PageHeader
        title="Cycle Insights"
        subtitle="Mathematical cycle patterns and symptom frequencies calculated from your recorded logs."
        showBack
        backUrl="/app/more"
      />

      {/* Cycle Statistics Summary */}
      {hasCycleData && (
        <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-rose-500" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Cycle Regularity &amp; Averages
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
                Avg Cycle Length
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {hasEnoughCyclesForAvg ? formatDays(avgCycleLength) : '—'}
              </p>
              <span className="text-[10px] text-slate-500">
                {hasEnoughCyclesForAvg ? 'Calculated average' : 'Need 2+ cycles'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Avg Period Duration
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {hasEnoughPeriodsForAvg ? formatDays(avgPeriodDuration) : '—'}
              </p>
              <span className="text-[10px] text-slate-500">
                {hasEnoughPeriodsForAvg ? 'Inclusive days' : 'Need 2+ periods'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100">
              <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider block">
                Shortest Cycle
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {shortestCycle ? formatDays(shortestCycle) : '—'}
              </p>
              <span className="text-[10px] text-slate-500">Minimum recorded</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
              <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
                Longest Cycle
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {longestCycle ? formatDays(longestCycle) : '—'}
              </p>
              <span className="text-[10px] text-slate-500">Maximum recorded</span>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Cycle Lengths Visual Chart */}
      {recentLengths.length > 0 && (
        <Card className="p-5 bg-white border border-slate-100 shadow-soft space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Recent Cycle Lengths
          </h2>
          <div className="space-y-2.5 pt-1">
            {recentLengths.map((item, idx) => {
              const maxL = longestCycle || 35;
              const pct = Math.min(100, Math.max(15, Math.round((item.length / maxL) * 100)));
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-slate-500 font-medium truncate">
                    {formatDateDisplay(item.date)}
                  </span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-bold text-slate-800">{item.length}d</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Period Durations Visual Chart */}
      {recentDurations.length > 0 && (
        <Card className="p-5 bg-white border border-slate-100 shadow-soft space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Recent Period Durations
          </h2>
          <div className="space-y-2.5 pt-1">
            {recentDurations.map((item, idx) => {
              const maxD = 10;
              const pct = Math.min(100, Math.max(20, Math.round((item.duration / maxD) * 100)));
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-slate-500 font-medium truncate">
                    {formatDateDisplay(item.date)}
                  </span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-bold text-slate-800">{item.duration}d</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Symptom Frequency Section */}
      {hasSymptomData && (
        <Card className="p-5 bg-white border border-slate-100 shadow-soft space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Symptom Frequency Distribution
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {symptomFrequency.map(({ symptom, count }) => (
              <div key={symptom} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{symptom}</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  {count} {count === 1 ? 'time' : 'times'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Non-Medical Disclaimer */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">Deterministic On-Device Analytics</p>
          <p>
            All cycle statistics and averages are computed deterministically from your recorded logs.
            These are personal insights and do not constitute clinical medical diagnosis or advice.
          </p>
        </div>
      </div>
    </div>
  );
};
