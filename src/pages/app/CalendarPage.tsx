import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/utils/cn';
import { useCycles } from '@/context/CycleContext';
import { formatDateDisplay } from '@/utils/cycleCalculations';

export const CalendarPage: React.FC = () => {
  const { cycles, prediction } = useCycles();

  // Navigation state (year and month 0-indexed)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayString, setSelectedDayString] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar grid calculations for current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const emptyPrefixSlots = Array.from({ length: firstDayIndex });
  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  // Set of recorded period day strings (YYYY-MM-DD)
  const recordedPeriodDays = useMemo(() => {
    const set = new Set<string>();
    cycles.forEach((cycle) => {
      const [sY, sM, sD] = cycle.start_date.split('-').map(Number);
      const start = new Date(Date.UTC(sY, sM - 1, sD));

      let end = new Date(start);
      if (cycle.end_date) {
        const [eY, eM, eD] = cycle.end_date.split('-').map(Number);
        end = new Date(Date.UTC(eY, eM - 1, eD));
      } else if (cycle.period_duration) {
        end.setUTCDate(end.getUTCDate() + cycle.period_duration - 1);
      }

      const curr = new Date(start);
      while (curr <= end) {
        const y = curr.getUTCFullYear();
        const m = String(curr.getUTCMonth() + 1).padStart(2, '0');
        const d = String(curr.getUTCDate()).padStart(2, '0');
        set.add(`${y}-${m}-${d}`);
        curr.setUTCDate(curr.getUTCDate() + 1);
      }
    });
    return set;
  }, [cycles]);

  // Set of estimated next period day strings (e.g. 5 days from predicted nextPeriodDate)
  const estimatedNextPeriodDays = useMemo(() => {
    const set = new Set<string>();
    if (!prediction?.nextPeriodDate) return set;

    const [pY, pM, pD] = prediction.nextPeriodDate.split('-').map(Number);
    const start = new Date(Date.UTC(pY, pM - 1, pD));

    for (let i = 0; i < 5; i++) {
      const curr = new Date(start);
      curr.setUTCDate(curr.getUTCDate() + i);
      const y = curr.getUTCFullYear();
      const m = String(curr.getUTCMonth() + 1).padStart(2, '0');
      const d = String(curr.getUTCDate()).padStart(2, '0');
      set.add(`${y}-${m}-${d}`);
    }
    return set;
  }, [prediction]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  // Status for selected date inspector
  const selectedStatus = useMemo(() => {
    if (!selectedDayString) return null;
    const isRecorded = recordedPeriodDays.has(selectedDayString);
    const isEstimated = estimatedNextPeriodDays.has(selectedDayString);
    const isToday = selectedDayString === todayStr;

    const associatedCycle = cycles.find((c) => {
      return (
        selectedDayString >= c.start_date &&
        (c.end_date ? selectedDayString <= c.end_date : selectedDayString === c.start_date)
      );
    });

    return {
      isRecorded,
      isEstimated,
      isToday,
      associatedCycle,
    };
  }, [selectedDayString, recordedPeriodDays, estimatedNextPeriodDays, todayStr, cycles]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Cycle Calendar"
        subtitle="Track recorded period days and review estimated upcoming dates."
        action={
          <Link to="/app/track">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Record Period
            </Button>
          </Link>
        }
      />

      {/* Calendar Card */}
      <Card className="p-4 sm:p-6 bg-white border border-slate-100 shadow-soft">
        {/* Month Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blush-500" />
            <h2 className="text-lg font-bold text-slate-900">{monthName}</h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2.5 py-1 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 py-3">
          {daysOfWeek.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {emptyPrefixSlots.map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-12" />
          ))}

          {monthDays.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDayString;
            const isPeriod = recordedPeriodDays.has(dateStr);
            const isEstimated = estimatedNextPeriodDays.has(dateStr);

            return (
              <div
                key={day}
                onClick={() => setSelectedDayString(dateStr)}
                className={cn(
                  'h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-2xl flex flex-col items-center justify-center text-xs font-semibold transition-all relative cursor-pointer select-none',
                  isSelected && 'ring-2 ring-slate-800 font-bold shadow-soft scale-105',
                  isPeriod
                    ? 'bg-blush-500 text-white shadow-soft-sm hover:bg-blush-600'
                    : isEstimated
                    ? 'bg-blush-50 text-blush-700 border border-dashed border-blush-300 hover:bg-blush-100'
                    : isToday
                    ? 'bg-slate-100 text-slate-900 font-bold border border-slate-300'
                    : 'text-slate-700 hover:bg-slate-100/80'
                )}
              >
                <span>{day}</span>
                {isToday && !isPeriod && (
                  <span className="w-1 h-1 rounded-full bg-slate-900 mt-0.5" />
                )}
                {isPeriod && (
                  <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-6 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blush-500" />
            <span className="text-slate-600 font-medium">Recorded Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blush-100 border border-blush-300" />
            <span className="text-slate-600 font-medium">Estimated Next Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-400" />
            <span className="text-slate-600 font-medium">Current Date</span>
          </div>
        </div>
      </Card>

      {/* Selected Day Inspector */}
      <Card variant="outline" className="p-5 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {formatDateDisplay(selectedDayString)}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedStatus?.isToday
                ? 'Today'
                : selectedStatus?.isRecorded
                ? 'Period day recorded in vault'
                : selectedStatus?.isEstimated
                ? 'Estimated future period window'
                : 'No period recorded for this day'}
            </p>
          </div>

          <div>
            {selectedStatus?.isRecorded ? (
              <Badge variant="blush" size="md">
                Period Recorded
              </Badge>
            ) : selectedStatus?.isEstimated ? (
              <Badge variant="coral" size="md">
                Estimated Period
              </Badge>
            ) : (
              <Badge variant="slate" size="md">
                Regular Day
              </Badge>
            )}
          </div>
        </div>

        {selectedStatus?.associatedCycle && (
          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
            <p>
              Part of cycle: <strong>{formatDateDisplay(selectedStatus.associatedCycle.start_date)}</strong>
              {selectedStatus.associatedCycle.end_date ? ` to ${formatDateDisplay(selectedStatus.associatedCycle.end_date)}` : ' (Ongoing)'}
            </p>
            {selectedStatus.associatedCycle.notes && (
              <p className="italic text-slate-500">Note: "{selectedStatus.associatedCycle.notes}"</p>
            )}
          </div>
        )}

        <div className="pt-2 flex gap-2">
          <Link to={`/app/track?edit=${selectedStatus?.associatedCycle?.id || ''}`}>
            <Button size="sm" variant={selectedStatus?.isRecorded ? 'outline' : 'primary'}>
              {selectedStatus?.isRecorded ? 'Edit This Period' : 'Log Period Starting This Day'}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
