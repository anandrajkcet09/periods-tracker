import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Clock,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  FileText,
  Loader2,
  Activity,
  Droplet,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { useCycles } from '@/context/CycleContext';
import { useSymptoms } from '@/context/SymptomContext';
import { formatDateDisplay } from '@/utils/cycleCalculations';
import { CycleRecord } from '@/types';
import { cn } from '@/utils/cn';

export const HistoryPage: React.FC = () => {
  const { cycles, avgCycleLength, avgPeriodDuration, removeCycle, loading: cyclesLoading } = useCycles();
  const { symptoms, removeSymptom, loading: symptomsLoading } = useSymptoms();

  const [activeTab, setActiveTab] = useState<'cycles' | 'symptoms'>('cycles');

  // Delete cycle modal state
  const [cycleToDelete, setCycleToDelete] = useState<CycleRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDeleteCycle = async () => {
    if (!cycleToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await removeCycle(cycleToDelete.id);
      setCycleToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete cycle record.';
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Grouped symptoms by date
  const groupedSymptoms = useMemo(() => {
    const map = new Map<string, typeof symptoms>();
    symptoms.forEach((s) => {
      if (!map.has(s.symptom_date)) map.set(s.symptom_date, []);
      map.get(s.symptom_date)!.push(s);
    });
    return Array.from(map.entries()).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [symptoms]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <PageHeader
        title="History"
        subtitle="Review, edit, and manage all your previously recorded periods and symptoms."
        action={
          <Link to="/app/track">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              + Record Entry
            </Button>
          </Link>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="outline" className="p-3.5 sm:p-4 text-center bg-white">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Cycles Logged
          </span>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            {cycles.length}
          </p>
        </Card>
        <Card variant="outline" className="p-3.5 sm:p-4 text-center bg-white">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Avg Cycle
          </span>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            {avgCycleLength} <span className="text-xs text-slate-400 font-normal">Days</span>
          </p>
        </Card>
        <Card variant="outline" className="p-3.5 sm:p-4 text-center bg-white">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
            Avg Period
          </span>
          <p className="text-lg sm:text-xl font-bold text-rose-600 mt-0.5">
            {avgPeriodDuration} <span className="text-xs text-slate-400 font-normal">Days</span>
          </p>
        </Card>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('cycles')}
          className={cn(
            'px-4 py-2 text-sm font-semibold border-b-2 transition-all select-none flex items-center gap-1.5',
            activeTab === 'cycles'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          )}
        >
          <Droplet className="w-4 h-4" />
          <span>Periods ({cycles.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('symptoms')}
          className={cn(
            'px-4 py-2 text-sm font-semibold border-b-2 transition-all select-none flex items-center gap-1.5',
            activeTab === 'symptoms'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          )}
        >
          <Activity className="w-4 h-4" />
          <span>Symptoms ({symptoms.length})</span>
        </button>
      </div>

      {/* 1. CYCLES LIST TAB */}
      {activeTab === 'cycles' && (
        <div className="space-y-3">
          {cyclesLoading ? (
            <Card className="p-8 text-center bg-white border border-slate-100">
              <p className="text-xs text-slate-400">Loading cycle records...</p>
            </Card>
          ) : cycles.length === 0 ? (
            <Card className="p-8 text-center space-y-4 bg-white border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Cycles Recorded</h3>
                <p className="text-xs text-slate-500">
                  Record your period start and end dates to build your cycle timeline.
                </p>
              </div>
              <Link to="/app/track">
                <Button size="md" variant="primary">
                  Record First Period
                </Button>
              </Link>
            </Card>
          ) : (
            cycles.map((cycle) => (
              <Card
                key={cycle.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 shadow-soft"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      {formatDateDisplay(cycle.start_date)}
                    </span>
                    <span className="text-slate-400 text-xs">to</span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {cycle.end_date ? formatDateDisplay(cycle.end_date) : 'Ongoing'}
                    </span>
                    {!cycle.end_date && (
                      <Badge variant="coral" size="sm">
                        Ongoing
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                        Period Duration
                      </span>
                      <strong className="text-slate-900 font-bold">
                        {cycle.period_duration
                          ? `${cycle.period_duration} Days`
                          : 'Ongoing'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                        Cycle Length
                      </span>
                      <strong className="text-slate-900 font-bold">
                        {cycle.cycle_length ? `${cycle.cycle_length} Days` : '—'}
                      </strong>
                    </div>
                  </div>

                  {cycle.notes && (
                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-start gap-1.5 border border-slate-100">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{cycle.notes}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:border-l sm:border-slate-100 sm:pl-4 self-end sm:self-center">
                  <Link to={`/app/track?edit=${cycle.id}`}>
                    <Button variant="outline" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setCycleToDelete(cycle)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* 2. SYMPTOMS LIST TAB */}
      {activeTab === 'symptoms' && (
        <div className="space-y-3">
          {symptomsLoading ? (
            <Card className="p-8 text-center bg-white border border-slate-100">
              <p className="text-xs text-slate-400">Loading symptom logs...</p>
            </Card>
          ) : symptoms.length === 0 ? (
            <Card className="p-8 text-center space-y-4 bg-white border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Symptoms Recorded</h3>
                <p className="text-xs text-slate-500">
                  Select and save symptoms anytime on the Track page.
                </p>
              </div>
              <Link to="/app/track">
                <Button size="md" variant="secondary">
                  Log Symptoms
                </Button>
              </Link>
            </Card>
          ) : (
            groupedSymptoms.map(([dateStr, items]) => (
              <Card key={dateStr} className="p-4 space-y-3 bg-white border border-slate-100 shadow-soft">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      {formatDateDisplay(dateStr)}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    {items.length} {items.length === 1 ? 'symptom' : 'symptoms'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{s.symptom}</span>
                        {s.severity && (
                          <Badge variant="coral" size="sm" className="ml-2">
                            {s.severity}
                          </Badge>
                        )}
                        {s.notes && <p className="text-slate-500 italic mt-0.5">"{s.notes}"</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSymptom(s.id)}
                        aria-label={`Delete symptom ${s.symptom}`}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(cycleToDelete)}
        onClose={() => {
          if (!isDeleting) setCycleToDelete(null);
        }}
        title="Delete Period Record"
        description="Are you sure you want to permanently remove this cycle record from your vault?"
      >
        <div className="space-y-4 pt-2">
          {cycleToDelete && (
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200">
              <p>
                <strong>Start Date:</strong> {formatDateDisplay(cycleToDelete.start_date)}
              </p>
              {cycleToDelete.end_date && (
                <p>
                  <strong>End Date:</strong> {formatDateDisplay(cycleToDelete.end_date)}
                </p>
              )}
            </div>
          )}

          {deleteError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCycleToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={confirmDeleteCycle}
              disabled={isDeleting}
              leftIcon={
                isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )
              }
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
