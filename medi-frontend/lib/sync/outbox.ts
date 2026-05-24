import { v4 as uuidv4 } from 'uuid'
import {
  getOutboxEntries,
  addOutboxEntry,
  removeOutboxEntry,
  updateOutboxEntry,
} from '@/lib/db/idb'
import type { OutboxEntry, QueueTicket, SyncAction } from '@/types'

export async function queueOutboxAction(
  action: SyncAction,
  payload: Partial<QueueTicket>
): Promise<void> {
  const entry: OutboxEntry = {
    id: uuidv4(),
    action,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
  }
  await addOutboxEntry(entry)
}

export async function processOutbox(): Promise<void> {
  const entries = await getOutboxEntries()

  if (entries.length === 0) return

  for (const entry of entries) {
    try {
      await simulateServerSync(entry)
      await removeOutboxEntry(entry.id)
    } catch (err) {
      const newRetryCount = entry.retryCount + 1
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'

      if (newRetryCount >= 5) {
        await removeOutboxEntry(entry.id)
      } else {
        await updateOutboxEntry(entry.id, {
          retryCount: newRetryCount,
          lastError: errorMsg,
        })
        const delay = Math.pow(2, newRetryCount) * 1000
        await sleep(delay)
      }
    }
  }
}

async function simulateServerSync(entry: OutboxEntry): Promise<void> {
  await sleep(300 + Math.random() * 200)

  if (Math.random() < 0.1) {
    throw new Error('Server temporarily unavailable')
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}