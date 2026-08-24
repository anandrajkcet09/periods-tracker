import { CycleRecord } from '@/types';

export type CyclePhaseType = 'period' | 'follicular' | 'fertile' | 'ovulation' | 'luteal';

export interface CyclePhaseInfo {
  phase: CyclePhaseType;
  label: string;
  badgeVariant: 'blush' | 'sage' | 'sky' | 'purple' | 'amber';
  colorClasses: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
  description: string;
}

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
  const currentCycleDay = daysSinceStart >= 0 ? (daysSinceStart % cycleLength) + 1 : 1;

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
 * Gets cycle phase info for a given cycle day.
 * All ovulation and fertile windows are strictly labeled as estimates.
 */
export function getCyclePhaseInfo(
  cycleDay: number,
  cycleLength: number = 28,
  periodDuration: number = 5
): CyclePhaseInfo {
  const pDuration = Math.max(1, Math.min(periodDuration, 10));
  const cLength = Math.max(20, Math.min(cycleLength, 50));
  const ovulationDay = Math.max(pDuration + 3, cLength - 14);
  const fertileStart = Math.max(pDuration + 1, ovulationDay - 4);
  const fertileEnd = Math.min(cLength - 1, ovulationDay + 1);

  if (cycleDay >= 1 && cycleDay <= pDuration) {
    return {
      phase: 'period',
      label: 'Period',
      badgeVariant: 'blush',
      colorClasses: {
        bg: 'bg-rose-50/80',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      },
      description: 'Menstrual phase. Energy may be lower; stay hydrated and rest.',
    };
  }

  if (cycleDay === ovulationDay) {
    return {
      phase: 'ovulation',
      label: 'Ovulation (estimated)',
      badgeVariant: 'purple',
      colorClasses: {
        bg: 'bg-purple-50/80',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      },
      description: 'Estimated midpoint based on your recorded cycle length.',
    };
  }

  if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
    return {
      phase: 'fertile',
      label: 'Fertile Window (estimated)',
      badgeVariant: 'sky',
      colorClasses: {
        bg: 'bg-sky-50/80',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
      },
      description: 'Estimated fertile phase based on cycle calculations.',
    };
  }

  if (cycleDay > pDuration && cycleDay < fertileStart) {
    return {
      phase: 'follicular',
      label: 'Follicular Phase',
      badgeVariant: 'sage',
      colorClasses: {
        bg: 'bg-emerald-50/80',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      },
      description: 'Follicular phase. Energy gradually rises after your period.',
    };
  }

  return {
    phase: 'luteal',
    label: 'Luteal Phase',
    badgeVariant: 'amber',
    colorClasses: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    description: 'Luteal phase. Progesterone peaks before the next cycle starts.',
  };
}

/**
 * Calculates estimated forecast dates (Next period, Fertile window, Ovulation date).
 */
export function getCycleForecast(
  latestStartDate: string,
  cycleLength: number = 28,
  periodDuration: number = 5
): {
  nextPeriodDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationDate: string;
} {
  const [year, month, day] = latestStartDate.split('-').map(Number);
  const startUTC = Date.UTC(year, month - 1, day);

  const cLength = Math.max(20, Math.min(cycleLength, 50));
  const pDuration = Math.max(1, Math.min(periodDuration, 10));
  const ovulationOffset = Math.max(pDuration + 3, cLength - 14) - 1; // 0-indexed day offset
  const fertileStartOffset = Math.max(pDuration, ovulationOffset - 4);
  const fertileEndOffset = Math.min(cLength - 2, ovulationOffset + 1);

  const formatDate = (ms: number): string => {
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  };

  const msPerDay = 86400000;
  return {
    nextPeriodDate: formatDate(startUTC + cLength * msPerDay),
    fertileWindowStart: formatDate(startUTC + fertileStartOffset * msPerDay),
    fertileWindowEnd: formatDate(startUTC + fertileEndOffset * msPerDay),
    ovulationDate: formatDate(startUTC + ovulationOffset * msPerDay),
  };
}

/**
 * Computes the phase for any given date string (YYYY-MM-DD) based on latest cycle.
 */
export function getPhaseForDate(
  dateStr: string,
  latestStartDate: string,
  cycleLength: number = 28,
  periodDuration: number = 5,
  isRecordedPeriod: boolean = false
): CyclePhaseInfo {
  if (isRecordedPeriod) {
    return {
      phase: 'period',
      label: 'Period (Logged)',
      badgeVariant: 'blush',
      colorClasses: {
        bg: 'bg-rose-100/90',
        text: 'text-rose-900',
        border: 'border-rose-300',
        dot: 'bg-rose-600',
      },
      description: 'Recorded menstrual flow day in your vault.',
    };
  }

  const [tY, tM, tD] = dateStr.split('-').map(Number);
  const targetUTC = Date.UTC(tY, tM - 1, tD);

  const [sY, sM, sD] = latestStartDate.split('-').map(Number);
  const startUTC = Date.UTC(sY, sM - 1, sD);

  const diffDays = Math.round((targetUTC - startUTC) / 86400000);
  const cLength = Math.max(20, Math.min(cycleLength, 50));
  const normalizedDay = ((diffDays % cLength) + cLength) % cLength + 1;

  return getCyclePhaseInfo(normalizedDay, cLength, periodDuration);
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

/**
 * Formats YYYY-MM-DD into a short date e.g. "22 Aug" or "Aug 22".
 */
export function formatShortDate(dateString?: string | null): string {
  if (!dateString) return '—';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;

  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}
