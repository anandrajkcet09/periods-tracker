import React, { useState } from 'react';
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
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { useCycles } from '@/context/CycleContext';
import { formatDateDisplay } from '@/utils/cycleCalculations';
import { CycleRecord } from '@/types';

export const HistoryPage: React.FC = () => {
  const { cycles, avgCycleLength, avgPeriodDuration, removeCycle, loading } = useCycles();

  // Delete modal state
  const [cycleToDelete, setCycleToDelete] = useState<CycleRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Cycle History"
        subtitle="Review, edit, or delete previously recorded menstrual cycles."
        action={
          <Link to="/app/track">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Record Period
            </Button>
          </Link>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card variant="outline" className="p-4 text-center bg-white">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Total Recorded
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {cycles.length} {cycles.length === 1 ? 'Cycle' : 'Cycles'}
          </p>
        </Card>
        <Card variant="outline" className="p-4 text-center bg-white">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Avg Cycle Length
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {avgCycleLength} Days
          </p>
        </Card>
        <Card variant="outline" className="p-4 text-center bg-white col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            Avg Period Duration
          </span>
          <p className="text-xl font-bold text-blush-600 mt-1">
            {avgPeriodDuration} Days
          </p>
        </Card>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recorded Cycles (Chronological)
            </h3>
          </div>
        </div>

        {loading ? (
          <Card className="p-8 text-center bg-white border border-slate-100">
            <p className="text-xs text-slate-400">Loading cycle history...</p>
          </Card>
        ) : cycles.length === 0 ? (
          <Card className="p-8 text-center space-y-4 bg-white border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No History Recorded</h3>
              <p className="text-xs text-slate-500">
                You haven't logged any menstrual cycles yet. Record your first period to start tracking.
              </p>
            </div>
            <Link to="/app/track">
              <Button size="md" variant="primary">
                Record First Period
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {cycles.map((cycle) => (
              <Card
                key={cycle.id}
                variant="default"
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
                        Ongoing Period
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
                          ? `${cycle.period_duration} ${cycle.period_duration === 1 ? 'Day' : 'Days (Inclusive)'}`
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
            ))}
          </div>
        )}
      </div>

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
              onClick={confirmDelete}
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
