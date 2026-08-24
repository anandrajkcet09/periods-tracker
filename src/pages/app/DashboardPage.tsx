import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  ShieldCheck,
  Droplet,
  Clock,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useCycles } from '@/context/CycleContext';
import { useSymptoms } from '@/context/SymptomContext';
import {
  formatDateDisplay,
  formatShortDate,
  getCyclePhaseInfo,
  getCycleForecast,
} from '@/utils/cycleCalculations';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { cycles, latestCycle, prediction, avgCycleLength, avgPeriodDuration, loading } = useCycles();
  const { symptoms } = useSymptoms();

  // Dynamic greeting based on current time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 17) return 'Good afternoon 👋';
    return 'Good evening 👋';
  }, []);

  const todayFormatted = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('en-US', { month: 'short' });
    return `Today • ${day} ${month}`;
  }, []);

  // Today's cycle metrics & phase calculation
  const cycleDay = prediction?.currentCycleDay || 1;
  const cycleLength = latestCycle?.cycle_length || avgCycleLength || 28;
  const periodDuration = latestCycle?.period_duration || avgPeriodDuration || 5;

  const currentPhase = useMemo(() => {
    return getCyclePhaseInfo(cycleDay, cycleLength, periodDuration);
  }, [cycleDay, cycleLength, periodDuration]);

  const forecast = useMemo(() => {
    if (!latestCycle) return null;
    return getCycleForecast(latestCycle.start_date, cycleLength, periodDuration);
  }, [latestCycle, cycleLength, periodDuration]);

  // Symptoms count for current cycle
  const symptomsThisCycle = useMemo(() => {
    if (!latestCycle) return symptoms.slice(0, 5);
    return symptoms.filter((s) => s.symptom_date >= latestCycle.start_date);
  }, [latestCycle, symptoms]);

  // Combined recent history feed
  const recentEvents = useMemo(() => {
    const events: { id: string; date: string; title: string; subtitle?: string; type: 'period' | 'symptom' }[] = [];

    cycles.slice(0, 3).forEach((c) => {
      events.push({
        id: `cycle-${c.id}`,
        date: c.start_date,
        title: 'Period started',
        subtitle: c.period_duration ? `${c.period_duration} days recorded` : 'Ongoing period',
        type: 'period',
      });
    });

    symptoms.slice(0, 3).forEach((s) => {
      events.push({
        id: `symptom-${s.id}`,
        date: s.symptom_date,
        title: `Logged: ${s.symptom}`,
        subtitle: s.severity ? `Severity: ${s.severity}` : undefined,
        type: 'symptom',
      });
    });

    return events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [cycles, symptoms]);

  // Circular gauge calculations
  const progressPercent = Math.min(100, Math.max(0, Math.round((cycleDay / cycleLength) * 100)));
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {user?.user_metadata?.username ? `Welcome back, ${user.user_metadata.username}` : 'Your private menstrual cycle overview'}
          </p>
        </div>
        <Link to="/app/track">
          <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            + Log Period
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="p-8 text-center bg-white border border-slate-100">
          <p className="text-xs text-slate-400">Loading your cycle vault...</p>
        </Card>
      ) : !latestCycle ? (
        /* Empty State: No Cycles Yet */
        <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-rose-50/80 via-white to-sky-50/50 border border-rose-100">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-soft">
            <Droplet className="w-7 h-7 fill-rose-500/20" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-slate-900">Welcome to Aura</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Log your latest period start date to activate your cycle day counter, phase insights, and calendar projections.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/app/track">
              <Button size="lg" variant="primary" leftIcon={<PlusCircle className="w-5 h-5" />}>
                Record First Period
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Main Cycle Status Hero Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-rose-50/90 via-white to-sky-50/60 border border-rose-100/90 p-6 sm:p-7 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-3">
                {/* Date & Phase Tag */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {todayFormatted}
                  </span>
                  <Badge variant={currentPhase.badgeVariant} size="sm">
                    {currentPhase.label}
                  </Badge>
                </div>

                {/* Primary Cycle Status */}
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {currentPhase.phase === 'period' ? 'Period' : currentPhase.label}
                  </h2>
                  <p className="text-sm font-semibold text-rose-700 mt-0.5">
                    Day {cycleDay} of your cycle
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    {currentPhase.description}
                  </p>
                </div>

                {/* Quick Info & Primary CTA */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link to="/app/track">
                    <Button size="md" variant="primary" leftIcon={<Droplet className="w-4 h-4" />}>
                      + Log Period
                    </Button>
                  </Link>
                  <Link to="/app/track">
                    <Button size="md" variant="secondary" leftIcon={<Activity className="w-4 h-4" />}>
                      Log Symptoms
                    </Button>
                  </Link>
                  <Link to="/app/calendar">
                    <Button size="md" variant="ghost" className="text-slate-600">
                      View Calendar →
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Clean Circular Progress Representation */}
              <div className="shrink-0 flex flex-col items-center justify-center self-center sm:self-auto">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-rose-100"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="text-rose-500 transition-all duration-700 ease-out"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                      {cycleDay}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                      of {cycleLength} days
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 mt-2">
                  Cycle Day: {cycleDay} / {cycleLength}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Insights Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            <Card variant="outline" className="p-3.5 sm:p-4 text-center bg-white">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Cycle Day
              </span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {cycleDay} <span className="text-xs text-slate-400 font-normal">/ {cycleLength}</span>
              </p>
            </Card>

            <Card variant="outline" className="p-3.5 sm:p-4 text-center bg-white">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Period Duration
              </span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {periodDuration} <span className="text-xs text-slate-400 font-normal">Days</span>
              </p>
            </Card>

            <Card variant="outline" className="p-3.5 sm:p-4 text-center bg-white">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Symptoms
              </span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                {symptomsThisCycle.length} <span className="text-xs text-slate-400 font-normal">logged</span>
              </p>
            </Card>
          </div>

          {/* Next Period & Phase Forecasts Card */}
          <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Upcoming Estimates
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Based on your recorded cycle
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Next Period */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-1">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                  Next Period
                </span>
                <p className="text-base font-extrabold text-slate-900">
                  {forecast ? formatDateDisplay(forecast.nextPeriodDate) : '—'}
                </p>
                <p className="text-xs text-slate-600">
                  {prediction?.daysUntil !== undefined
                    ? prediction.daysUntil === 0
                      ? 'Due today'
                      : prediction.daysUntil > 0
                      ? `In ${prediction.daysUntil} ${prediction.daysUntil === 1 ? 'day' : 'days'}`
                      : `${Math.abs(prediction.daysUntil)} days past estimate`
                    : 'Estimated'}
                </p>
              </div>

              {/* Fertile Window */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-1">
                <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                  Fertile Window (estimated)
                </span>
                <p className="text-base font-extrabold text-slate-900">
                  {forecast ? `${formatShortDate(forecast.fertileWindowStart)} – ${formatShortDate(forecast.fertileWindowEnd)}` : '—'}
                </p>
                <p className="text-xs text-slate-600">
                  Estimated based on cycle length
                </p>
              </div>

              {/* Ovulation */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1">
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                  Ovulation (estimated)
                </span>
                <p className="text-base font-extrabold text-slate-900">
                  {forecast ? formatDateDisplay(forecast.ovulationDate) : '—'}
                </p>
                <p className="text-xs text-slate-600">
                  Estimated midpoint
                </p>
              </div>
            </div>
          </Card>

          {/* Recent History Section */}
          {recentEvents.length > 0 && (
            <Card className="p-5 space-y-3 bg-white border border-slate-100 shadow-soft">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Recent History
                  </h3>
                </div>
                <Link
                  to="/app/history"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {recentEvents.map((evt) => (
                  <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${evt.type === 'period' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <div>
                        <span className="font-semibold text-slate-900">{evt.title}</span>
                        {evt.subtitle && <span className="text-slate-500 ml-2">({evt.subtitle})</span>}
                      </div>
                    </div>
                    <span className="text-slate-500 font-medium">{formatDateDisplay(evt.date)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Non-Medical Disclaimer & Privacy Assurance */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-800">Personal Health Tracking Insights</p>
              <p>
                All cycle predictions, fertile windows, and ovulation estimates are calculated mathematically from your logged dates.
                They are for personal tracking only and are not medical advice, clinical diagnostics, or contraception.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
