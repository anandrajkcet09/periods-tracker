// src/lib/syncManager.ts
import { OfflineOperation, getPendingOps, updateOperation, removeOperation } from './offlineQueue';
import { cycleService } from '@/services/cycleService';
import { symptomService } from '@/services/symptomService';

const MAX_RETRIES = 5;

/**
 * Process pending offline operations for a given user.
 * This function is intended to be called when network connectivity is restored.
 */
export async function runSync(userId: string): Promise<void> {
  const ops = await getPendingOps(userId);
  for (const op of ops) {
    try {
      await updateOperation(userId, op.id, { status: 'syncing' });
      // Dispatch to the appropriate service based on entity and type
      if (op.entity === 'cycle') {
        await handleCycleOp(userId, op);
      } else if (op.entity === 'symptom') {
        await handleSymptomOp(userId, op);
      }
      // Success – remove from queue
      await removeOperation(userId, op.id);
    } catch (error) {
      console.error('Sync error for operation', op.id, error);
      const newRetry = (op.retryCount || 0) + 1;
      if (newRetry >= MAX_RETRIES) {
        await updateOperation(userId, op.id, { status: 'failed', retryCount: newRetry });
        // Optionally surface a toast/notification elsewhere in UI
      } else {
        await updateOperation(userId, op.id, { status: 'pending', retryCount: newRetry });
        // Exponential back‑off delay before next attempt (handled by caller's retry cycle)
        const delay = Math.min(30000, 2000 * Math.pow(2, newRetry - 1));
        await new Promise((res) => setTimeout(res, delay));
        // Re‑queue this operation by continuing the loop (it will be fetched again on next runSync)
      }
    }
  }
}

async function handleCycleOp(userId: string, op: OfflineOperation): Promise<void> {
  const { type, payload } = op;
  switch (type) {
    case 'create':
      await cycleService.createCycle(userId, payload);
      break;
    case 'update':
      // payload should contain { id, changes }
      await cycleService.updateCycle(userId, payload.id, payload.changes);
      break;
    case 'delete':
      await cycleService.deleteCycle(userId, payload.id);
      break;
  }
}

async function handleSymptomOp(userId: string, op: OfflineOperation): Promise<void> {
  const { type, payload } = op;
  switch (type) {
    case 'create':
      await symptomService.createSymptom(userId, payload);
      break;
    case 'update':
      await symptomService.updateSymptom(userId, payload.id, payload.changes);
      break;
    case 'delete':
      await symptomService.deleteSymptom(userId, payload.id);
      break;
  }
}
