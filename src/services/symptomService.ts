import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SymptomRecord, SymptomInput } from '@/types';

const LOCAL_STORAGE_KEY = 'aura_local_symptoms';

export const symptomService = {
  async getSymptoms(userId: string): Promise<SymptomRecord[]> {
    if (!isSupabaseConfigured()) {
      const local = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
      if (local) {
        try {
          return JSON.parse(local) as SymptomRecord[];
        } catch {
          return [];
        }
      }
      return [];
    }

    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', userId)
      .order('symptom_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching symptoms from Supabase:', error);
      throw new Error(error.message);
    }

    return (data as SymptomRecord[]) || [];
  },

  async createSymptom(userId: string, input: SymptomInput): Promise<SymptomRecord> {
    if (!isSupabaseConfigured()) {
      const existing = await this.getSymptoms(userId);
      const newSymptom: SymptomRecord = {
        id: crypto.randomUUID ? crypto.randomUUID() : `symp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user_id: userId,
        cycle_id: input.cycle_id ?? null,
        symptom_date: input.symptom_date,
        symptom: input.symptom,
        severity: input.severity ?? null,
        notes: input.notes ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newSymptom, ...existing].sort(
        (a, b) => new Date(b.symptom_date).getTime() - new Date(a.symptom_date).getTime()
      );
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      return newSymptom;
    }

    const { data, error } = await supabase
      .from('symptoms')
      .insert({
        user_id: userId,
        cycle_id: input.cycle_id || null,
        symptom_date: input.symptom_date,
        symptom: input.symptom,
        severity: input.severity || null,
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating symptom in Supabase:', error);
      throw new Error(error.message);
    }

    return data as SymptomRecord;
  },

  async createBulkSymptoms(
    userId: string,
    inputs: SymptomInput[]
  ): Promise<SymptomRecord[]> {
    if (inputs.length === 0) return [];

    if (!isSupabaseConfigured()) {
      const created: SymptomRecord[] = [];
      for (const input of inputs) {
        const item = await this.createSymptom(userId, input);
        created.push(item);
      }
      return created;
    }

    const rows = inputs.map((input) => ({
      user_id: userId,
      cycle_id: input.cycle_id || null,
      symptom_date: input.symptom_date,
      symptom: input.symptom,
      severity: input.severity || null,
      notes: input.notes || null,
    }));

    const { data, error } = await supabase
      .from('symptoms')
      .insert(rows)
      .select();

    if (error) {
      console.error('Error inserting bulk symptoms in Supabase:', error);
      throw new Error(error.message);
    }

    return (data as SymptomRecord[]) || [];
  },

  async updateSymptom(
    userId: string,
    symptomId: string,
    input: SymptomInput
  ): Promise<SymptomRecord> {
    if (!isSupabaseConfigured()) {
      const existing = await this.getSymptoms(userId);
      const index = existing.findIndex((s) => s.id === symptomId);
      if (index === -1) throw new Error('Symptom record not found');

      const updatedSymptom: SymptomRecord = {
        ...existing[index],
        cycle_id: input.cycle_id ?? existing[index].cycle_id,
        symptom_date: input.symptom_date,
        symptom: input.symptom,
        severity: input.severity ?? null,
        notes: input.notes ?? null,
        updated_at: new Date().toISOString(),
      };

      existing[index] = updatedSymptom;
      const sorted = existing.sort(
        (a, b) => new Date(b.symptom_date).getTime() - new Date(a.symptom_date).getTime()
      );
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(sorted));
      return updatedSymptom;
    }

    const { data, error } = await supabase
      .from('symptoms')
      .update({
        cycle_id: input.cycle_id || null,
        symptom_date: input.symptom_date,
        symptom: input.symptom,
        severity: input.severity || null,
        notes: input.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', symptomId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating symptom in Supabase:', error);
      throw new Error(error.message);
    }

    return data as SymptomRecord;
  },

  async deleteSymptom(userId: string, symptomId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const existing = await this.getSymptoms(userId);
      const filtered = existing.filter((s) => s.id !== symptomId);
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(filtered));
      return;
    }

    const { error } = await supabase
      .from('symptoms')
      .delete()
      .eq('id', symptomId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting symptom in Supabase:', error);
      throw new Error(error.message);
    }
  },
};
