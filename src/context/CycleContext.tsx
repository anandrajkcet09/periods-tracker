import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { CycleRecord, CycleInput } from '@/types';
import { useAuth } from './AuthContext';
import { cycleService } from '@/services/cycleService';
import { predictNextPeriod } from '@/utils/cycleCalculations';

interface CycleContextType {
  cycles: CycleRecord[];
  loading: boolean;
  latestCycle: CycleRecord | null;
  prediction: {
    nextPeriodDate: string;
    daysUntil: number;
    currentCycleDay: number;
    isOverdue: boolean;
  } | null;
  avgCycleLength: number;
  avgPeriodDuration: number;
  addCycle: (input: CycleInput) => Promise<CycleRecord>;
  editCycle: (cycleId: string, input: CycleInput) => Promise<CycleRecord>;
  removeCycle: (cycleId: string) => Promise<void>;
  refreshCycles: () => Promise<void>;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const CycleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCycles = useCallback(async () => {
    if (!user) {
      setCycles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await cycleService.getCycles(user.id);
      setCycles(data);
    } catch (err) {
      console.error('Failed to load cycles:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  const latestCycle = useMemo(() => {
    if (cycles.length === 0) return null;
    return cycles[0]; // Already ordered by start_date DESC
  }, [cycles]);

  // Calculate averages from historical cycles
  const { avgCycleLength, avgPeriodDuration } = useMemo(() => {
    const cycleLengths = cycles.map((c) => c.cycle_length).filter((l): l is number => Boolean(l && l > 0));
    const periodDurations = cycles.map((c) => c.period_duration).filter((d): d is number => Boolean(d && d > 0));

    const avgCL = cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : (latestCycle?.cycle_length || 28);

    const avgPD = periodDurations.length > 0
      ? Math.round(periodDurations.reduce((a, b) => a + b, 0) / periodDurations.length)
      : (latestCycle?.period_duration || 5);

    return { avgCycleLength: avgCL, avgPeriodDuration: avgPD };
  }, [cycles, latestCycle]);

  // Deterministic Next Period Prediction
  const prediction = useMemo(() => {
    if (!latestCycle) return null;
    const effectiveCycleLength = latestCycle.cycle_length || avgCycleLength || 28;
    return predictNextPeriod(latestCycle.start_date, effectiveCycleLength);
  }, [latestCycle, avgCycleLength]);

  const addCycle = async (input: CycleInput): Promise<CycleRecord> => {
    if (!user) throw new Error('User must be logged in to record a period');
    const created = await cycleService.createCycle(user.id, input);
    await fetchCycles();
    return created;
  };

  const editCycle = async (cycleId: string, input: CycleInput): Promise<CycleRecord> => {
    if (!user) throw new Error('User must be logged in to edit a cycle');
    const updated = await cycleService.updateCycle(user.id, cycleId, input);
    await fetchCycles();
    return updated;
  };

  const removeCycle = async (cycleId: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in to delete a cycle');
    await cycleService.deleteCycle(user.id, cycleId);
    await fetchCycles();
  };

  const value: CycleContextType = {
    cycles,
    loading,
    latestCycle,
    prediction,
    avgCycleLength,
    avgPeriodDuration,
    addCycle,
    editCycle,
    removeCycle,
    refreshCycles: fetchCycles,
  };

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
};

export const useCycles = (): CycleContextType => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycles must be used within a CycleProvider');
  }
  return context;
};
