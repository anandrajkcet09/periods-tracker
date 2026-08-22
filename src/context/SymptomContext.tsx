import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { SymptomRecord, SymptomInput } from '@/types';
import { useAuth } from './AuthContext';
import { useCycles } from './CycleContext';
import { symptomService } from '@/services/symptomService';

interface SymptomContextType {
  symptoms: SymptomRecord[];
  loading: boolean;
  recentSymptoms: SymptomRecord[];
  getSymptomsForDate: (date: string) => SymptomRecord[];
  getSymptomsForCycle: (cycleId: string) => SymptomRecord[];
  addSymptom: (input: SymptomInput) => Promise<SymptomRecord>;
  addBulkSymptoms: (inputs: SymptomInput[]) => Promise<SymptomRecord[]>;
  editSymptom: (id: string, input: SymptomInput) => Promise<SymptomRecord>;
  removeSymptom: (id: string) => Promise<void>;
  refreshSymptoms: () => Promise<void>;
}

const SymptomContext = createContext<SymptomContextType | undefined>(undefined);

export const SymptomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { cycles } = useCycles();
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSymptoms = useCallback(async () => {
    if (!user) {
      setSymptoms([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await symptomService.getSymptoms(user.id);
      setSymptoms(data);
    } catch (err) {
      console.error('Failed to load symptoms:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSymptoms();
  }, [fetchSymptoms]);

  // Helper to find matching cycle for a symptom date
  const findCycleForDate = useCallback(
    (dateStr: string): string | null => {
      const match = cycles.find((c) => {
        if (c.end_date) {
          return dateStr >= c.start_date && dateStr <= c.end_date;
        }
        return dateStr >= c.start_date;
      });
      return match ? match.id : null;
    },
    [cycles]
  );

  const getSymptomsForDate = useCallback(
    (date: string) => {
      return symptoms.filter((s) => s.symptom_date === date);
    },
    [symptoms]
  );

  const getSymptomsForCycle = useCallback(
    (cycleId: string) => {
      const cycle = cycles.find((c) => c.id === cycleId);
      if (!cycle) return symptoms.filter((s) => s.cycle_id === cycleId);

      return symptoms.filter((s) => {
        if (s.cycle_id === cycleId) return true;
        if (cycle.end_date) {
          return s.symptom_date >= cycle.start_date && s.symptom_date <= cycle.end_date;
        }
        return s.symptom_date >= cycle.start_date;
      });
    },
    [symptoms, cycles]
  );

  const recentSymptoms = useMemo(() => {
    return symptoms.slice(0, 4);
  }, [symptoms]);

  const addSymptom = async (input: SymptomInput): Promise<SymptomRecord> => {
    if (!user) throw new Error('User must be logged in to record symptoms');
    const cycleId = input.cycle_id !== undefined ? input.cycle_id : findCycleForDate(input.symptom_date);
    const created = await symptomService.createSymptom(user.id, {
      ...input,
      cycle_id: cycleId,
    });
    await fetchSymptoms();
    return created;
  };

  const addBulkSymptoms = async (inputs: SymptomInput[]): Promise<SymptomRecord[]> => {
    if (!user) throw new Error('User must be logged in to record symptoms');
    const enriched = inputs.map((input) => ({
      ...input,
      cycle_id: input.cycle_id !== undefined ? input.cycle_id : findCycleForDate(input.symptom_date),
    }));
    const created = await symptomService.createBulkSymptoms(user.id, enriched);
    await fetchSymptoms();
    return created;
  };

  const editSymptom = async (id: string, input: SymptomInput): Promise<SymptomRecord> => {
    if (!user) throw new Error('User must be logged in to edit symptoms');
    const cycleId = input.cycle_id !== undefined ? input.cycle_id : findCycleForDate(input.symptom_date);
    const updated = await symptomService.updateSymptom(user.id, id, {
      ...input,
      cycle_id: cycleId,
    });
    await fetchSymptoms();
    return updated;
  };

  const removeSymptom = async (id: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in to delete symptoms');
    await symptomService.deleteSymptom(user.id, id);
    await fetchSymptoms();
  };

  const value: SymptomContextType = {
    symptoms,
    loading,
    recentSymptoms,
    getSymptomsForDate,
    getSymptomsForCycle,
    addSymptom,
    addBulkSymptoms,
    editSymptom,
    removeSymptom,
    refreshSymptoms: fetchSymptoms,
  };

  return <SymptomContext.Provider value={value}>{children}</SymptomContext.Provider>;
};

export const useSymptoms = (): SymptomContextType => {
  const context = useContext(SymptomContext);
  if (!context) {
    throw new Error('useSymptoms must be used within a SymptomProvider');
  }
  return context;
};
