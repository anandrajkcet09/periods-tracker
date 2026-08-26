// src/lib/offlineQueue.ts
import { get, set, del } from 'idb-keyval';

export type OfflineOperation = {
  id: string;
  userId: string;
  entity: 'cycle' | 'symptom';
  type: 'create' | 'update' | 'delete';
  payload: any; // data for create/update, { recordId } for delete
  status: 'pending' | 'syncing' | 'failed' | 'success';
  retryCount: number;
  createdAt: number;
};

const KEY_PREFIX = 'offline_queue_';

function queueKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

/** Add a new operation to the queue. Generates a UUID for the operation if the browser supports `crypto.randomUUID`. */
export async function addOperation(
  op: Omit<OfflineOperation, 'id' | 'status' | 'retryCount' | 'createdAt'> & { userId: string },
): Promise<OfflineOperation> {
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
  const newOp: OfflineOperation = {
    id,
    status: 'pending',
    retryCount: 0,
    createdAt: Date.now(),
    ...op,
  };
  const key = queueKey(op.userId);
  const existing = (await get<OfflineOperation[]>(key)) ?? [];
  existing.push(newOp);
  await set(key, existing);
  return newOp;
}

/** Retrieve all pending (and non‑successful) operations for a user. */
export async function getPendingOps(userId: string): Promise<OfflineOperation[]> {
  const key = queueKey(userId);
  const ops = (await get<OfflineOperation[]>(key)) ?? [];
  return ops.filter((op) => op.status !== 'success');
}

/** Update an operation's status or retry count. */
export async function updateOperation(
  userId: string,
  id: string,
  updates: Partial<Pick<OfflineOperation, 'status' | 'retryCount'>>,
): Promise<void> {
  const key = queueKey(userId);
  const ops = (await get<OfflineOperation[]>(key)) ?? [];
  const idx = ops.findIndex((o) => o.id === id);
  if (idx === -1) return;
  ops[idx] = { ...ops[idx], ...updates };
  await set(key, ops);
}

/** Remove an operation after successful synchronization. */
export async function removeOperation(userId: string, id: string): Promise<void> {
  const key = queueKey(userId);
  const ops = (await get<OfflineOperation[]>(key)) ?? [];
  const filtered = ops.filter((o) => o.id !== id);
  await set(key, filtered);
}

/** Clear all queued operations for a specific user (e.g., on logout). */
export async function clearUserQueue(userId: string): Promise<void> {
  await del(queueKey(userId));
}
