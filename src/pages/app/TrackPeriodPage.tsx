import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Save,
  Check,
  AlertCircle,
  AlertTriangle,
  Clock,
  FileText,
  Loader2,
  Sparkles,
  Info,
  Plus,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { useCycles } from '@/context/CycleContext';
import { useSymptoms } from '@/context/SymptomContext';
import {
  calculatePeriodDuration,
  calculateCycleLength,
  checkCycleOverlap,
} from '@/utils/cycleCalculations';
import { SUGGESTED_SYMPTOMS, SymptomSeverity } from '@/types';

export const TrackPeriodPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCycleId = searchParams.get('edit');

  const { cycles, addCycle, editCycle } = useCycles();
  const { addBulkSymptoms, getSymptomsForDate } = useSymptoms();

  // Find cycle if editing
  const existingCycleToEdit = useMemo(() => {
    if (!editCycleId) return null;
    return cycles.find((c) => c.id === editCycleId) || null;
  }, [editCycleId, cycles]);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>('');
  const [cycleLength, setCycleLength] = useState<string>('28');
  const [notes, setNotes] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // ----- Symptom UI State -----
  const [symptomInput, setSymptomInput] = useState({
    symptom: '',
    severity: '' as SymptomSeverity | '',
    notes: '',
  });
  const [symptomList, setSymptomList] = useState([] as any[]);

  // Load existing symptoms for the selected start date when editing a cycle
  useEffect(() => {
    if (existingCycleToEdit) {
      // Load symptoms for the start date of the cycle (or allow editing later)
      const loaded = getSymptomsForDate(existingCycleToEdit.start_date);
      setSymptomList(loaded);
    }
  }, [existingCycleToEdit, getSymptomsForDate]);

  // Initialize fields when editing
  useEffect(() => {
    if (existingCycleToEdit) {
      setStartDate(existingCycleToEdit.start_date);
      setEndDate(existingCycleToEdit.end_date || '');
      setCycleLength(existingCycleToEdit.cycle_length ? String(existingCycleToEdit.cycle_length) : '28');
      setNotes(existingCycleToEdit.notes || '');
    }
  }, [existingCycleToEdit]);

  // Find previous cycle relative to selected start date
  const previousCycle = useMemo(() => {
    if (!startDate) return null;
    const sorted = [...cycles]
      .filter((c) => (existingCycleToEdit ? c.id !== existingCycleToEdit.id : true))
      .filter((c) => new Date(c.start_date) < new Date(startDate))
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
    return sorted[0] || null;
  }, [startDate, cycles, existingCycleToEdit]);

  // Auto-suggest cycle length if previous cycle exists and user hasn't heavily customized
  useEffect(() => {
    if (!existingCycleToEdit && previousCycle && startDate) {
      const calculated = calculateCycleLength(startDate, previousCycle.start_date);
      if (calculated && calculated >= 15 && calculated <= 60) {
        setCycleLength(String(calculated));
      }
    }
  }, [startDate, previousCycle, existingCycleToEdit]);

  // Computed period duration in inclusive calendar days
  const computedDuration = useMemo(() => {
    if (!startDate || !endDate) return null;
    return calculatePeriodDuration(startDate, endDate);
  }, [startDate, endDate]);

  // Overlap warning
  const hasOverlap = useMemo(() => {
    if (!startDate) return false;
    return checkCycleOverlap(startDate, endDate || null, cycles, existingCycleToEdit?.id);
  }, [startDate, endDate, cycles, existingCycleToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!startDate) {
      setFormError('Period start date is required.');
      return;
    }
    if (endDate && new Date(endDate) < new Date(startDate)) {
      setFormError('Period end date cannot be earlier than the start date.');
      return;
    }
    const numCycleLength = cycleLength ? parseInt(cycleLength, 10) : null;
    if (numCycleLength !== null && (isNaN(numCycleLength) || numCycleLength < 15 || numCycleLength > 60)) {
      setFormError('Typical cycle length must be between 15 and 60 days.');
      return;
    }

    setIsSubmitting(true);
    try {
      const duration = calculatePeriodDuration(startDate, endDate || null);
      if (existingCycleToEdit) {
        await editCycle(existingCycleToEdit.id, {
          start_date: startDate,
          end_date: endDate || null,
          cycle_length: numCycleLength,
          period_duration: duration,
          notes: notes.trim() || null,
        });
      } else {
        await addCycle({
          start_date: startDate,
          end_date: endDate || null,
          cycle_length: numCycleLength,
          period_duration: duration,
          notes: notes.trim() || null,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => navigate('/app/dashboard'), 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save period record.';
      setFormError(msg);
      setIsSubmitting(false);
    }
  };

  // ----- Symptom Handlers -----
  const handleAddSymptom = () => {
    if (!symptomInput.symptom) return;
    const newSymptom = {
      ...symptomInput,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      symptom_date: startDate, // associate with selected start date for simplicity
    };
    setSymptomList((prev) => [newSymptom, ...prev]);
    setSymptomInput({ symptom: '', severity: '', notes: '' });
  };

  const handleSaveSymptoms = async () => {
    if (symptomList.length === 0) return;
    const inputs = symptomList.map((s) => ({
      symptom_date: s.symptom_date,
      symptom: s.symptom,
      severity: s.severity || null,
      notes: s.notes || null,
    }));
    try {
      await addBulkSymptoms(inputs);
      setSymptomList([]);
    } catch (e) {
      console.error('Error saving symptoms', e);
    }
  };

  const handleDeleteSymptom = (id: string) => {
    setSymptomList((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title={existingCycleToEdit ? 'Edit Recorded Period' : 'Record Period'}
        subtitle="Log your menstrual cycle start date, optional end date, and notes."
        showBack
        backUrl="/app/dashboard"
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Alert */}
        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Overlap Warning */}
        {hasOverlap && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-semibold">Potential Date Overlap:</strong>
              <p>These dates overlap with another existing cycle record in your vault. Please double check to keep history consistent.</p>
            </div>
          </div>
        )}

        {/* Dates Card */}
        <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-blush-500" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Period Dates</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <Input
                label="Period Start Date *"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <p className="text-[11px] text-slate-500 mt-1 pl-1">The day your menstrual flow began.</p>
            </div>

            {/* End Date */}
            <div>
              <Input
                label="Period End Date (Optional)"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
              <p className="text-[11px] text-slate-500 mt-1 pl-1">Leave blank if your period is currently ongoing.</p>
            </div>
          </div>

          {/* Period Duration Live Calculation Indicator */}
          {computedDuration !== null ? (
            <div className="p-3 bg-blush-50/80 border border-blush-200/60 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blush-600" />
                <span className="text-xs font-semibold text-blush-900">Calculated Duration:</span>
              </div>
              <Badge variant="blush" size="md">
                {computedDuration} {computedDuration === 1 ? 'Calendar Day' : 'Calendar Days (Inclusive)'}
              </Badge>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Status: <strong>Ongoing Period</strong> (Duration will calculate when end date is added).</span>
            </div>
          )}
        </Card>

        {/* Cycle Length Card */}
        <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sage-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Cycle Length (Days)</h3>
            </div>
            {previousCycle && (
              <Badge variant="sage" size="sm">Auto-calculated from previous cycle</Badge>
            )}
          </div>

          <div className="max-w-xs">
            <Input
              label="Cycle Duration in Days"
              type="number"
              min={15}
              max={60}
              placeholder="28"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              helperText="Typical cycle length is 21–35 days (allowed range: 15–60 days)."
            />
          </div>

          {previousCycle && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              Previous period started on <strong>{previousCycle.start_date}</strong> ({calculateCycleLength(startDate, previousCycle.start_date)} days between starts).
            </p>
          )}
        </Card>

        {/* Notes Card */}
        <Card className="p-5 space-y-3 bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Private Notes (Optional)</h3>
          </div>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record any personal details (flow intensity, symptoms, medications, or observations)..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blush-500/10 focus:border-blush-400"
          />
        </Card>

        {/* Symptom Tracker Card */}
        <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Plus className="w-4 h-4 text-sage-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Symptom Tracker</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Symptom</label>
              <select
                value={symptomInput.symptom}
                onChange={(e) => setSymptomInput((prev) => ({ ...prev, symptom: e.target.value }))}
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
              >
                <option value="">Select symptom…</option>
                {SUGGESTED_SYMPTOMS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Severity (optional)</label>
              <select
                value={symptomInput.severity}
                onChange={(e) => setSymptomInput((prev) => ({ ...prev, severity: e.target.value as SymptomSeverity }))}
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
              >
                <option value="">None</option>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes (optional)</label>
              <textarea
                rows={2}
                value={symptomInput.notes}
                onChange={(e) => setSymptomInput((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                placeholder="Additional details..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" variant="primary" onClick={handleAddSymptom} disabled={!symptomInput.symptom}>
              Add Symptom
            </Button>
            {symptomList.length > 0 && (
              <Button size="sm" variant="secondary" onClick={handleSaveSymptoms}>
                Save Symptoms
              </Button>
            )}
          </div>

          {/* List of added symptoms */}
          {symptomList.length > 0 && (
            <ul className="mt-3 space-y-2 text-xs">
              {symptomList.map((s) => (
                <li key={s.id} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                  <div>
                    <span className="font-medium">{s.symptom}</span>
                    {s.severity && <span className="ml-2 text-slate-600">({s.severity})</span>}
                    {s.notes && <p className="text-slate-500 mt-0.5">{s.notes}</p>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteSymptom(s.id)}>
                    <X className="w-4 h-4 text-slate-500" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            leftIcon={
              savedSuccess ? (
                <Check className="w-5 h-5 text-white" />
              ) : isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )
            }
          >
            {savedSuccess
              ? 'Saved Successfully!'
              : isSubmitting
              ? 'Saving to Vault...'
              : existingCycleToEdit
              ? 'Update Period Record'
              : 'Save Period Record'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate('/app/dashboard')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
