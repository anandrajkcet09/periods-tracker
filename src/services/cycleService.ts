import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CycleRecord, CycleInput } from '@/types';

const LOCAL_STORAGE_KEY = 'aura_local_cycles';

export const cycleService = {
  async getCycles(userId: string): Promise<CycleRecord[]> {
    if (!isSupabaseConfigured()) {
      const local = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
      if (local) {
        try {
          return JSON.parse(local) as CycleRecord[];
        } catch {
          return [];
        }
      }
      return [];
    }

    const { data, error } = await supabase
      .from('cycles')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching cycles from Supabase:', error);
      throw new Error(error.message);
    }

    return (data as CycleRecord[]) || [];
  },

  async createCycle(userId: string, input: CycleInput): Promise<CycleRecord> {
    if (!isSupabaseConfigured()) {
      const existing = await this.getCycles(userId);
      const newCycle: CycleRecord = {
        id: crypto.randomUUID ? crypto.randomUUID() : `local_${Date.now()}`,
        user_id: userId,
        start_date: input.start_date,
        end_date: input.end_date ?? null,
        cycle_length: input.cycle_length ?? null,
        period_duration: input.period_duration ?? null,
        notes: input.notes ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newCycle, ...existing].sort(
        (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      return newCycle;
    }

    const { data, error } = await supabase
      .from('cycles')
      .insert({
        user_id: userId,
        start_date: input.start_date,
        end_date: input.end_date || null,
        cycle_length: input.cycle_length || null,
        period_duration: input.period_duration || null,
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting cycle in Supabase:', error);
      throw new Error(error.message);
    }

    return data as CycleRecord;
  },

  async updateCycle(
    userId: string,
    cycleId: string,
    input: CycleInput
  ): Promise<CycleRecord> {
    if (!isSupabaseConfigured()) {
      const existing = await this.getCycles(userId);
      const index = existing.findIndex((c) => c.id === cycleId);
      if (index === -1) throw new Error('Cycle record not found');

      const updatedCycle: CycleRecord = {
        ...existing[index],
        start_date: input.start_date,
        end_date: input.end_date ?? null,
        cycle_length: input.cycle_length ?? null,
        period_duration: input.period_duration ?? null,
        notes: input.notes ?? null,
        updated_at: new Date().toISOString(),
      };

      existing[index] = updatedCycle;
      const sorted = existing.sort(
        (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(sorted));
      return updatedCycle;
    }

    const { data, error } = await supabase
      .from('cycles')
      .update({
        start_date: input.start_date,
        end_date: input.end_date || null,
        cycle_length: input.cycle_length || null,
        period_duration: input.period_duration || null,
        notes: input.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cycleId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating cycle in Supabase:', error);
      throw new Error(error.message);
    }

    return data as CycleRecord;
  },

  async deleteCycle(userId: string, cycleId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const existing = await this.getCycles(userId);
      const filtered = existing.filter((c) => c.id !== cycleId);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(filtered));
      return;
    }

    const { error } = await supabase
      .from('cycles')
      .delete()
      .eq('id', cycleId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting cycle in Supabase:', error);
      throw new Error(error.message);
    }
  },
};
