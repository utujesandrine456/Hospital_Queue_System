import type { QueueTicket, SyncAction } from '@/types'

/** Legacy hook — queue sync is handled directly via the REST API to PostgreSQL. */
export async function queueOutboxAction(
  _action: SyncAction,
  _payload: Partial<QueueTicket>,
): Promise<void> {
  /* no-op */
}

export async function processOutbox(): Promise<void> {
  /* no-op */
}
