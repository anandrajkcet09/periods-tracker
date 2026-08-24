import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Save,
  Check,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Activity,
  Plus,
  Trash2,
  Droplet,
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
  formatDateDisplay,
} from '@/utils/cycleCalculations';
import { SUGGESTED_SYMPTOMS, SymptomSeverity } from '@/types';
import { cn } from '@/utils/cn';

export const TrackPeriodPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCycleId = searchParams.get('edit');
  const queryDate = searchParams.get('date');

  const { cycles, addCycle, editCycle } = useCycles();
  const { symptoms, addBulkSymptoms, removeSymptom } = useSymptoms();

  // Find cycle if editing
  const existingCycleToEdit = useMemo(() => {
    if (!editCycleId) return null;
    return cycles.find((c) => c.id === editCycleId) || null;
  }, [editCycleId, cycles]);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(queryDate || todayStr);
  const [endDate, setEndDate] = useState<string>('');
  const [cycleLength, setCycleLength] = useState<string>('28');
  const [notes, setNotes] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // ----- Multi-Select Symptoms State -----
  const [symptomDate, setSymptomDate] = useState<string>(queryDate || todayStr);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<SymptomSeverity | ''>('');
  const [symptomNotes, setSymptomNotes] = useState<string>('');
  const [isSavingSymptoms, setIsSavingSymptoms] = useState<boolean>(false);
  const [symptomSavedSuccess, setSymptomSavedSuccess] = useState<boolean>(false);

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

  // Handle Period Submission
  const handleSubmitPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!startDate) {
      setFormError('Please select a period start date.');
      return;
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      setFormError('Period end date cannot be earlier than the start date.');
      return;
    }

    const parsedLength = parseInt(cycleLength, 10);
    if (isNaN(parsedLength) || parsedLength < 15 || parsedLength > 60) {
      setFormError('Typical cycle length must be between 15 and 60 days.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingCycleToEdit) {
        await editCycle(existingCycleToEdit.id, {
          start_date: startDate,
          end_date: endDate || null,
          cycle_length: parsedLength,
          period_duration: computedDuration,
          notes: notes.trim() || null,
        });
      } else {
        await addCycle({
          start_date: startDate,
          end_date: endDate || null,
          cycle_length: parsedLength,
          period_duration: computedDuration,
          notes: notes.trim() || null,
        });
      }

      setSavedSuccess(true);
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 900);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save cycle record.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle multi-select symptom
  const toggleSymptom = (symptomName: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomName)
        ? prev.filter((item) => item !== symptomName)
        : [...prev, symptomName]
    );
  };

  // Handle saving multi-selected symptoms
  const handleSaveSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;

    setIsSavingSymptoms(true);
    const inputs = selectedSymptoms.map((sym) => ({
      symptom_date: symptomDate,
      symptom: sym,
      severity: selectedSeverity || null,
      notes: symptomNotes.trim() || null,
    }));

    try {
      await addBulkSymptoms(inputs);
      setSelectedSymptoms([]);
      setSelectedSeverity('');
      setSymptomNotes('');
      setSymptomSavedSuccess(true);
      setTimeout(() => setSymptomSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Error saving symptoms:', e);
    } finally {
      setIsSavingSymptoms(false);
    }
  };

  // Symptoms already logged for the chosen symptom date
  const loggedSymptomsForDate = useMemo(() => {
    return symptoms.filter((s) => s.symptom_date === symptomDate);
  }, [symptoms, symptomDate]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <PageHeader
        title={existingCycleToEdit ? 'Edit Recorded Period' : 'Track Period & Symptoms'}
        subtitle="Log your menstrual cycle start/end dates and record symptoms with one tap."
        showBack
        backUrl="/app/dashboard"
      />

      {/* 1. PERIOD LOGGING FORM */}
      <form onSubmit={handleSubmitPeriod} className="space-y-5">
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
              <p>These dates overlap with another existing cycle record in your vault.</p>
            </div>
          </div>
        )}

        {/* Period Dates Card */}
        <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Period Dates
              </h3>
            </div>
            {computedDuration && (
              <Badge variant="blush" size="sm">
                Duration: {computedDuration} Days
              </Badge>
            )}
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
              <p className="text-[11px] text-slate-500 mt-1 pl-1">Day menstrual flow started.</p>
            </div>

            {/* End Date */}
            <div>
              <Input
                label="Period End Date (Optional)"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-1 pl-1">Leave blank if period is ongoing.</p>
            </div>
          </div>

          {/* Cycle Length Setting */}
          <div className="pt-2">
            <Input
              label="Typical Cycle Length (Days)"
              type="number"
              min={15}
              max={60}
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              helperText="Typical cycle length is 21–35 days (allowed range: 15–60 days)."
            />
          </div>

          {previousCycle && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              Previous period started on <strong>{previousCycle.start_date}</strong> (
              {calculateCycleLength(startDate, previousCycle.start_date)} days interval).
            </p>
          )}

          {/* Notes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Private Cycle Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record flow intensity, medications, or personal observations..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400"
            />
          </div>

          {/* Save Period CTA */}
          <div className="pt-2">
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
                ? 'Saving Period Record...'
                : existingCycleToEdit
                ? 'Update Period Record'
                : 'Save Period Record'}
            </Button>
          </div>
        </Card>
      </form>

      {/* 2. MULTI-SELECT SYMPTOMS TRACKER */}
      <Card className="p-5 space-y-4 bg-white border border-slate-100 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">How are you feeling?</h3>
              <p className="text-xs text-slate-500">Select all symptoms that apply for this day</p>
            </div>
          </div>
          <div className="w-40">
            <input
              type="date"
              value={symptomDate}
              onChange={(e) => setSymptomDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Multi-Select Chips */}
        <div>
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTED_SYMPTOMS.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none flex items-center gap-1.5 border',
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft scale-105'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  )}
                >
                  <span>{isSelected ? '✓' : '+'}</span>
                  <span>{sym}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Severity Selector & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Severity (Optional)
            </label>
            <div className="flex gap-2">
              {(['Mild', 'Moderate', 'Severe'] as SymptomSeverity[]).map((sev) => {
                const isSelected = selectedSeverity === sev;
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSelectedSeverity(isSelected ? '' : sev)}
                    className={cn(
                      'flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center',
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-500 shadow-soft'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Symptom Notes (Optional)
            </label>
            <input
              type="text"
              value={symptomNotes}
              onChange={(e) => setSymptomNotes(e.target.value)}
              placeholder="e.g. morning cramps, herbal tea helped..."
              className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Save Symptoms Action */}
        <div className="pt-2 flex items-center justify-between">
          <Button
            type="button"
            size="md"
            variant="secondary"
            onClick={handleSaveSymptoms}
            disabled={selectedSymptoms.length === 0 || isSavingSymptoms}
            leftIcon={
              symptomSavedSuccess ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : isSavingSymptoms ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )
            }
          >
            {symptomSavedSuccess
              ? 'Symptoms Saved!'
              : selectedSymptoms.length > 0
              ? `Save ${selectedSymptoms.length} Selected Symptom${selectedSymptoms.length > 1 ? 's' : ''}`
              : 'Select Symptoms to Save'}
          </Button>

          {selectedSymptoms.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedSymptoms([])}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Clear selection
            </button>
          )}
        </div>

        {/* Symptoms already logged on chosen date */}
        {loggedSymptomsForDate.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Logged on {formatDateDisplay(symptomDate)}:
            </h4>
            <div className="flex flex-wrap gap-2">
              {loggedSymptomsForDate.map((s) => (
                <div
                  key={s.id}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs"
                >
                  <span className="font-semibold text-slate-800">{s.symptom}</span>
                  {s.severity && <Badge variant="coral" size="sm">{s.severity}</Badge>}
                  {s.notes && <span className="text-slate-400 italic">"{s.notes}"</span>}
                  <button
                    type="button"
                    onClick={() => removeSymptom(s.id)}
                    aria-label={`Delete ${s.symptom}`}
                    className="text-slate-400 hover:text-rose-600 p-0.5 ml-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
