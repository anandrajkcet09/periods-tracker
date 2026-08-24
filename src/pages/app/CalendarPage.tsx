import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Activity,
  Droplet,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/utils/cn';
import { useCycles } from '@/context/CycleContext';
import { useSymptoms } from '@/context/SymptomContext';
import {
  formatDateDisplay,
  getPhaseForDate,
} from '@/utils/cycleCalculations';

export const CalendarPage: React.FC = () => {
  const { cycles, latestCycle, avgCycleLength, avgPeriodDuration } = useCycles();
  const { symptoms } = useSymptoms();

  // Selected date state & current view month
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

  // Calendar grid calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const emptyPrefixSlots = Array.from({ length: firstDayIndex });
  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  // Today in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  // Recorded period days (exact date strings in set)
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
      } else {
        end.setUTCDate(end.getUTCDate() + (avgPeriodDuration || 5) - 1);
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
  }, [cycles, avgPeriodDuration]);

  // Symptoms indexed by date string
  const recordedSymptomDays = useMemo(() => {
    const map = new Map<string, typeof symptoms>();
    symptoms.forEach((s) => {
      const date = s.symptom_date;
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(s);
    });
    return map;
  }, [symptoms]);

  const cycleLength = latestCycle?.cycle_length || avgCycleLength || 28;
  const periodDuration = latestCycle?.period_duration || avgPeriodDuration || 5;

  // Selected date info
  const selectedInfo = useMemo(() => {
    if (!selectedDayString) return null;
    const isToday = selectedDayString === todayStr;
    const isRecorded = recordedPeriodDays.has(selectedDayString);
    const daySymptoms = recordedSymptomDays.get(selectedDayString) || [];

    const associatedCycle = cycles.find((c) => {
      return (
        selectedDayString >= c.start_date &&
        (c.end_date ? selectedDayString <= c.end_date : selectedDayString === c.start_date)
      );
    });

    let phaseInfo = null;
    let cycleDayNum = null;
    if (latestCycle) {
      phaseInfo = getPhaseForDate(
        selectedDayString,
        latestCycle.start_date,
        cycleLength,
        periodDuration,
        isRecorded
      );

      const [tY, tM, tD] = selectedDayString.split('-').map(Number);
      const targetUTC = Date.UTC(tY, tM - 1, tD);
      const [sY, sM, sD] = latestCycle.start_date.split('-').map(Number);
      const startUTC = Date.UTC(sY, sM - 1, sD);
      const diff = Math.round((targetUTC - startUTC) / 86400000);
      cycleDayNum = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
    }

    return {
      dateStr: selectedDayString,
      isToday,
      isRecorded,
      daySymptoms,
      associatedCycle,
      phaseInfo,
      cycleDayNum,
    };
  }, [selectedDayString, todayStr, recordedPeriodDays, recordedSymptomDays, cycles, latestCycle, cycleLength, periodDuration]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <PageHeader
        title="Cycle Calendar"
        subtitle="Visual cycle calendar showing phases, period days, and logged symptoms."
        action={
          <Link to="/app/track">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              + Log Period
            </Button>
          </Link>
        }
      />

      {/* Calendar Card */}
      <Card className="p-4 sm:p-6 bg-white border border-slate-100 shadow-soft space-y-4">
        {/* Month Header & Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900">{monthName}</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              aria-label="Previous month"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                setSelectedDayString(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              aria-label="Next month"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 py-1">
          {daysOfWeek.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        {/* Days Grid with Soft Pastel Phase Highlights */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {emptyPrefixSlots.map((_, i) => (
            <div key={`empty-${i}`} className="h-10 sm:h-12" />
          ))}

          {monthDays.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDayString;
            const isRecorded = recordedPeriodDays.has(dateStr);
            const hasSymptom = recordedSymptomDays.has(dateStr);

            // Compute phase color styling
            let phaseClasses = 'bg-slate-50/60 text-slate-700 hover:bg-slate-100';
            if (latestCycle) {
              const phase = getPhaseForDate(dateStr, latestCycle.start_date, cycleLength, periodDuration, isRecorded);
              if (isRecorded || phase.phase === 'period') {
                phaseClasses = 'bg-rose-100/80 text-rose-900 font-semibold hover:bg-rose-200/80';
              } else if (phase.phase === 'ovulation') {
                phaseClasses = 'bg-purple-100/90 text-purple-900 font-bold hover:bg-purple-200/80';
              } else if (phase.phase === 'fertile') {
                phaseClasses = 'bg-sky-100/80 text-sky-900 hover:bg-sky-200/80';
              } else if (phase.phase === 'follicular') {
                phaseClasses = 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100';
              } else if (phase.phase === 'luteal') {
                phaseClasses = 'bg-amber-50/80 text-amber-800 hover:bg-amber-100';
              }
            }

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDayString(dateStr)}
                aria-label={`Select ${dateStr}`}
                className={cn(
                  'h-10 sm:h-12 rounded-2xl flex flex-col items-center justify-center text-xs transition-all relative select-none cursor-pointer',
                  phaseClasses,
                  isToday && 'ring-2 ring-slate-900 font-extrabold',
                  isSelected && 'ring-2 ring-rose-500 scale-105 shadow-soft z-10'
                )}
              >
                <span>{day}</span>
                {/* Small indicator dot for symptoms */}
                {hasSymptom && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" title="Symptom logged" />
                )}
              </button>
            );
          })}
        </div>

        {/* Soft Pastel Phase Legend */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-200 border border-rose-400" />
            <span className="text-slate-700 font-medium">Period</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300" />
            <span className="text-slate-700 font-medium">Follicular</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-200 border border-sky-300" />
            <span className="text-slate-700 font-medium">Fertile Window (est.)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-200 border border-purple-400" />
            <span className="text-slate-700 font-medium">Ovulation (est.)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300" />
            <span className="text-slate-700 font-medium">Luteal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-medium">Symptom Logged</span>
          </div>
        </div>
      </Card>

      {/* Selected Day Inspector Card */}
      {selectedInfo && (
        <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {formatDateDisplay(selectedInfo.dateStr)}
                </h3>
                {selectedInfo.isToday && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedInfo.cycleDayNum
                  ? `Cycle Day ${selectedInfo.cycleDayNum} of ${cycleLength}`
                  : 'No cycle records for this timeline'}
              </p>
            </div>

            {selectedInfo.phaseInfo && (
              <Badge variant={selectedInfo.phaseInfo.badgeVariant} size="md">
                {selectedInfo.phaseInfo.label}
              </Badge>
            )}
          </div>

          {/* Details & Symptoms */}
          <div className="space-y-3">
            {selectedInfo.phaseInfo && (
              <p className="text-xs text-slate-600">
                {selectedInfo.phaseInfo.description}
              </p>
            )}

            {selectedInfo.associatedCycle && (
              <div className="p-3 bg-rose-50/60 rounded-xl text-xs text-slate-700 border border-rose-100 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <Droplet className="w-3.5 h-3.5 text-rose-500" />
                  <span>Period Logged in Vault</span>
                </div>
                <p>
                  Started on {formatDateDisplay(selectedInfo.associatedCycle.start_date)}
                  {selectedInfo.associatedCycle.end_date ? ` to ${formatDateDisplay(selectedInfo.associatedCycle.end_date)}` : ' (Ongoing)'}
                </p>
                {selectedInfo.associatedCycle.notes && (
                  <p className="italic text-slate-500">"{selectedInfo.associatedCycle.notes}"</p>
                )}
              </div>
            )}

            {/* Symptoms list for the selected day */}
            {selectedInfo.daySymptoms.length > 0 ? (
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Logged Symptoms ({selectedInfo.daySymptoms.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedInfo.daySymptoms.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800">{s.symptom}</span>
                      <div className="flex items-center gap-1.5">
                        {s.severity && (
                          <Badge variant="coral" size="sm">
                            {s.severity}
                          </Badge>
                        )}
                        {s.notes && <span className="text-slate-400 italic">"{s.notes}"</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No symptoms logged for this date.
              </p>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <Link to={`/app/track?edit=${selectedInfo.associatedCycle?.id || ''}`}>
                <Button size="sm" variant={selectedInfo.isRecorded ? 'outline' : 'primary'}>
                  {selectedInfo.isRecorded ? 'Edit Period Log' : '+ Log Period for This Day'}
                </Button>
              </Link>
              <Link to={`/app/track?date=${selectedInfo.dateStr}`}>
                <Button size="sm" variant="secondary" leftIcon={<Plus className="w-4 h-4" />}>
                  Log Symptoms
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CalendarPage;
