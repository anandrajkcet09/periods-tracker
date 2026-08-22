export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy' | 'none';

export type MoodType =
  | 'calm'
  | 'happy'
  | 'energetic'
  | 'sensitive'
  | 'anxious'
  | 'irritated'
  | 'exhausted'
  | 'neutral';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleRecord {
  id: string;
  user_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD or null
  cycle_length: number | null;
  period_duration: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CycleInput {
  start_date: string;
  end_date?: string | null;
  cycle_length?: number | null;
  period_duration?: number | null;
  notes?: string | null;
}

export type SymptomSeverity = 'Mild' | 'Moderate' | 'Severe';

export interface SymptomRecord {
  id: string;
  user_id: string;
  cycle_id: string | null;
  symptom_date: string; // YYYY-MM-DD
  symptom: string;
  severity: SymptomSeverity | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SymptomInput {
  cycle_id?: string | null;
  symptom_date: string;
  symptom: string;
  severity?: SymptomSeverity | null;
  notes?: string | null;
}

export const SUGGESTED_SYMPTOMS = [
  'Cramps',
  'Headache',
  'Back Pain',
  'Bloating',
  'Fatigue',
  'Acne',
  'Mood Changes',
  'Breast Tenderness',
  'Nausea',
  'Other',
] as const;

export type SuggestedSymptomName = typeof SUGGESTED_SYMPTOMS[number];

export interface DailyLog {
  id?: string;
  date: string;
  flow: FlowIntensity;
  moods: MoodType[];
  symptoms: string[];
  notes?: string;
  temperature?: number;
}
