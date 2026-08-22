import React from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCycles } from '@/context/CycleContext';
import { useSymptoms } from '@/context/SymptomContext';

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

  const recentLengths = cycles.slice(0, 5).map((c) => c.cycle_length).filter((l): l is number => !!l);
  const recentDurations = cycles
    .slice(0, 5)
    .map((c) => c.period_duration)
    .filter((d): d is number => !!d);

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
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Insights" subtitle="Loading your data…" />
      </div>
    );
  }

  if (!hasCycleData && !hasSymptomData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Insights" subtitle="No insights yet" />
        <Card className="p-6 bg-white">
          <p className="text-center text-sm text-slate-600">
            Track a few cycles and log symptoms to see your personal patterns.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader title="Insights" subtitle="Personal tracking insights based on your data" />

      {/* Cycle Section */}
      {hasCycleData && (
        <Card className="p-5 space-y-4 bg-white border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Cycle</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-slate-600">Average Cycle Length</h3>
              <p className="text-base font-semibold text-slate-800 mt-1">
                {hasEnoughCyclesForAvg ? formatDays(avgCycleLength) : 'Not enough data yet.'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Shortest Cycle</h3>
              <p className="text-base font-semibold text-slate-800 mt-1">
                {shortestCycle ? formatDays(shortestCycle) : '—'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Longest Cycle</h3>
              <p className="text-base font-semibold text-slate-800 mt-1">
                {longestCycle ? formatDays(longestCycle) : '—'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Average Period Duration</h3>
              <p className="text-base font-semibold text-slate-800 mt-1">
                {hasEnoughPeriodsForAvg ? formatDays(avgPeriodDuration) : 'Not enough data yet.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Cycle Lengths */}
      {recentLengths.length > 0 && (
        <Card className="p-5 bg-white border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Recent Cycle Lengths</h2>
          <ul className="space-y-2">
            {recentLengths.map((len, idx) => (
              <li key={idx} className="flex items-center">
                <span className="w-24 text-sm text-slate-600">Cycle {cycles[idx].start_date}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded mr-2 overflow-hidden">
                  <div className="h-full bg-blush-500" style={{ width: `${(len / (longestCycle || len)) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-slate-800">{len}d</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recent Period Durations */}
      {recentDurations.length > 0 && (
        <Card className="p-5 bg-white border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Recent Period Durations</h2>
          <ul className="space-y-2">
            {recentDurations.map((dur, idx) => (
              <li key={idx} className="flex items-center">
                <span className="w-24 text-sm text-slate-600">Cycle {cycles[idx].start_date}</span>
                <div className="flex-1 h-3 bg-slate-100 rounded mr-2 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(dur / (longestCycle || dur)) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-slate-800">{dur}d</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Symptoms Section */}
      {hasSymptomData && (
        <Card className="p-5 bg-white border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Symptoms</h2>
          <ul className="space-y-2">
            {symptomFrequency.map(({ symptom, count }) => (
              <li key={symptom} className="flex justify-between text-sm text-slate-800">
                <span>{symptom}</span>
                <span>{count} {count === 1 ? 'time' : 'times'}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Disclaimer */}
      <Card variant="outline" className="p-4 text-xs text-slate-600 bg-white border border-slate-200">
        <p>
          These insights are based on the information you record and are not medical advice. They are provided solely for personal tracking purposes.
        </p>
      </Card>
    </div>
  );
};
