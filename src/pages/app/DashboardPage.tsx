import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  Droplet,
  Info,
  Edit,
  History,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCycles } from '@/context/CycleContext';
import { formatDateDisplay } from '@/utils/cycleCalculations';

export const DashboardPage: React.FC = () => {
  const { cycles, latestCycle, prediction, avgCycleLength, avgPeriodDuration, loading } = useCycles();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Cycle Overview"
        subtitle={
          latestCycle
            ? `Latest period recorded on ${formatDateDisplay(latestCycle.start_date)}`
            : 'Welcome to your private period tracking vault.'
        }
        action={
          <Link to="/app/track">
            <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
              {latestCycle ? 'Log / Update Period' : 'Record First Period'}
            </Button>
          </Link>
        }
      />

      {loading ? (
        <Card className="p-8 text-center bg-white border border-slate-100">
          <p className="text-xs text-slate-400">Loading cycle data...</p>
        </Card>
      ) : !latestCycle ? (
        /* Empty State: No Period Recorded Yet */
        <Card className="p-8 text-center space-y-4 bg-gradient-to-br from-blush-50/70 via-white to-sage-50/50 border border-blush-100">
          <div className="w-14 h-14 rounded-2xl bg-blush-100 text-blush-600 flex items-center justify-center mx-auto shadow-soft">
            <Droplet className="w-7 h-7 fill-blush-500/20" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-slate-900">No Period Recorded Yet</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Log the start date of your latest period to calculate your current cycle day and view next-period estimates.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/app/track">
              <Button size="lg" variant="primary" leftIcon={<PlusCircle className="w-5 h-5" />}>
                Record My First Period
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Active Cycle Hero Card */
        <Card className="relative overflow-hidden bg-gradient-to-br from-blush-50/90 via-white to-sage-50/60 border border-blush-100/80 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="blush" size="sm">
                  Cycle Day {prediction?.currentCycleDay ?? '—'}
                </Badge>
                <Badge variant="sage" size="sm">
                  Cycle Length: {latestCycle.cycle_length || avgCycleLength} Days
                </Badge>
                {latestCycle.period_duration ? (
                  <Badge variant="slate" size="sm">
                    Duration: {latestCycle.period_duration} Days
                  </Badge>
                ) : (
                  <Badge variant="coral" size="sm">
                    Period Ongoing
                  </Badge>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Estimated Next Period
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {prediction ? formatDateDisplay(prediction.nextPeriodDate) : '—'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {prediction?.daysUntil !== undefined
                    ? prediction.daysUntil === 0
                      ? 'Period is due today'
                      : prediction.daysUntil > 0
                      ? `Estimated in ${prediction.daysUntil} ${prediction.daysUntil === 1 ? 'day' : 'days'}`
                      : `Period is ${Math.abs(prediction.daysUntil)} days past estimated date`
                    : 'Estimated based on your cycle'}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2.5">
                <Link to="/app/track">
                  <Button size="sm" variant="primary" leftIcon={<Droplet className="w-4 h-4" />}>
                    Record New Period
                  </Button>
                </Link>
                <Link to={`/app/track?edit=${latestCycle.id}`}>
                  <Button size="sm" variant="outline" leftIcon={<Edit className="w-4 h-4" />}>
                    Edit Current Period
                  </Button>
                </Link>
                <Link to="/app/calendar">
                  <Button size="sm" variant="soft" leftIcon={<CalendarIcon className="w-4 h-4" />}>
                    View Calendar
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cycle Status Ring */}
            <div className="shrink-0 flex items-center justify-center self-center sm:self-auto">
              <div className="relative w-32 h-32 rounded-full border-4 border-blush-100 flex flex-col items-center justify-center bg-white shadow-soft">
                <span className="text-3xl font-black text-slate-900">
                  {prediction?.currentCycleDay ?? 1}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Cycle Day
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cycle Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="outline" className="p-4 space-y-1 bg-white">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Latest Period Start
          </span>
          <p className="text-xl font-bold text-slate-900">
            {formatDateDisplay(latestCycle?.start_date)}
          </p>
          <p className="text-[11px] text-slate-500">
            {latestCycle?.end_date
              ? `Ended: ${formatDateDisplay(latestCycle.end_date)}`
              : 'Status: Ongoing period'}
          </p>
        </Card>

        <Card variant="outline" className="p-4 space-y-1 bg-white">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Average Cycle Length
          </span>
          <p className="text-xl font-bold text-slate-900">
            {avgCycleLength} Days
          </p>
          <p className="text-[11px] text-slate-500">
            Based on {cycles.length} recorded {cycles.length === 1 ? 'cycle' : 'cycles'}
          </p>
        </Card>

        <Card variant="outline" className="p-4 space-y-1 bg-white">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Average Period Duration
          </span>
          <p className="text-xl font-bold text-slate-900">
            {avgPeriodDuration} Days
          </p>
          <p className="text-[11px] text-slate-500">
            Inclusive calendar days
          </p>
        </Card>
      </div>

      {/* Recent History Quick Summary */}
      {cycles.length > 0 && (
        <Card className="p-5 space-y-3 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Recent Period Logs
              </h3>
            </div>
            <Link to="/app/history" className="text-xs font-semibold text-blush-600 hover:underline flex items-center gap-0.5">
              View All History <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {cycles.slice(0, 3).map((cycle) => (
              <div key={cycle.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">
                    {formatDateDisplay(cycle.start_date)}
                  </span>
                  <span className="text-slate-500 ml-2">
                    {cycle.end_date ? `to ${formatDateDisplay(cycle.end_date)}` : '(Ongoing)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="blush" size="sm">
                    {cycle.period_duration ? `${cycle.period_duration} Days` : 'Ongoing'}
                  </Badge>
                  <Link to={`/app/track?edit=${cycle.id}`} className="text-slate-400 hover:text-slate-700 p-1">
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Non-Medical Disclaimer & Privacy Note */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">Deterministic Mathematical Estimates</p>
          <p>
            Future period dates are estimates based strictly on your recorded cycle lengths.
            This application is not intended for medical diagnosis, contraception, or clinical health advice.
          </p>
        </div>
      </div>
    </div>
  );
};
