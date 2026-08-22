import { CycleRecord } from '@/types';

/**
 * Calculates period duration in calendar days inclusive.
 * e.g. Start 21 Aug, End 25 Aug = 5 days.
 */
export function calculatePeriodDuration(
  startDate: string,
  endDate?: string | null
): number | null {
  if (!startDate || !endDate) return null;

  const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
  const [eYear, eMonth, eDay] = endDate.split('-').map(Number);

  const startUTC = Date.UTC(sYear, sMonth - 1, sDay);
  const endUTC = Date.UTC(eYear, eMonth - 1, eDay);

  if (endUTC < startUTC) return null;

  const diffDays = Math.round((endUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1;
  return diffDays >= 1 ? diffDays : null;
}

/**
 * Calculates cycle length from previous cycle start date to current cycle start date.
 * Cycle length = current cycle start date - previous cycle start date
 */
export function calculateCycleLength(
  currentStart: string,
  previousStart?: string | null
): number | null {
  if (!currentStart || !previousStart) return null;

  const [cYear, cMonth, cDay] = currentStart.split('-').map(Number);
  const [pYear, pMonth, pDay] = previousStart.split('-').map(Number);

  const currentUTC = Date.UTC(cYear, cMonth - 1, cDay);
  const prevUTC = Date.UTC(pYear, pMonth - 1, pDay);

  if (currentUTC <= prevUTC) return null;

  const diffDays = Math.round((currentUTC - prevUTC) / (1000 * 60 * 60 * 24));
  return diffDays >= 15 && diffDays <= 60 ? diffDays : diffDays > 0 ? diffDays : null;
}

/**
 * Deterministic Next Period Prediction:
 * next_period_date = latest_period_start_date + cycle_length
 */
export function predictNextPeriod(
  latestStartDate: string,
  cycleLength: number = 28
): {
  nextPeriodDate: string;
  daysUntil: number;
  currentCycleDay: number;
  isOverdue: boolean;
} {
  const [year, month, day] = latestStartDate.split('-').map(Number);
  const startUTC = Date.UTC(year, month - 1, day);

  // Today in UTC
  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  // Current Cycle Day
  const daysSinceStart = Math.round((todayUTC - startUTC) / (1000 * 60 * 60 * 24));
  const currentCycleDay = daysSinceStart >= 0 ? daysSinceStart + 1 : 1;

  // Next Period Date
  const nextPeriodUTC = startUTC + cycleLength * (1000 * 60 * 60 * 24);
  const nextDateObj = new Date(nextPeriodUTC);
  const nextYear = nextDateObj.getUTCFullYear();
  const nextMonth = String(nextDateObj.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(nextDateObj.getUTCDate()).padStart(2, '0');
  const nextPeriodDate = `${nextYear}-${nextMonth}-${nextDay}`;

  // Days until next period
  const daysUntil = Math.round((nextPeriodUTC - todayUTC) / (1000 * 60 * 60 * 24));

  return {
    nextPeriodDate,
    daysUntil,
    currentCycleDay,
    isOverdue: daysUntil < 0,
  };
}

/**
 * Checks for overlapping cycles to warn the user against data corruption.
 */
export function checkCycleOverlap(
  startDate: string,
  endDate: string | null | undefined,
  existingCycles: CycleRecord[],
  excludeCycleId?: string
): boolean {
  if (!startDate) return false;

  const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
  const startUTC = Date.UTC(sYear, sMonth - 1, sDay);

  let endUTC = startUTC;
  if (endDate) {
    const [eYear, eMonth, eDay] = endDate.split('-').map(Number);
    endUTC = Date.UTC(eYear, eMonth - 1, eDay);
  }

  return existingCycles.some((cycle) => {
    if (excludeCycleId && cycle.id === excludeCycleId) return false;

    const [cStartYear, cStartMonth, cStartDay] = cycle.start_date.split('-').map(Number);
    const cycleStartUTC = Date.UTC(cStartYear, cStartMonth - 1, cStartDay);

    let cycleEndUTC = cycleStartUTC + (cycle.period_duration ? (cycle.period_duration - 1) * 86400000 : 0);
    if (cycle.end_date) {
      const [cEndYear, cEndMonth, cEndDay] = cycle.end_date.split('-').map(Number);
      cycleEndUTC = Date.UTC(cEndYear, cEndMonth - 1, cEndDay);
    }

    // Overlaps if intervals intersect
    return startUTC <= cycleEndUTC && endUTC >= cycleStartUTC;
  });
}

/**
 * Formats YYYY-MM-DD into a calm human-readable date e.g. "Aug 21, 2026".
 */
export function formatDateDisplay(dateString?: string | null): string {
  if (!dateString) return '—';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;

  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
