import { ticketsApi } from './tickets'
import { mapTicketFromApi } from './mappers'
import { useQueueStore } from '@/store/queueStore'
import type { QueueTicket } from '@/types'

/** Synchronous lookup — use before any network call. */
export function resolveTicketFromStore(ticketId: string): QueueTicket | null {
  const state = useQueueStore.getState()

  if (state.myTicket?.id === ticketId) {
    return state.myTicket
  }

  return state.allTickets.find(t => t.id === ticketId) ?? null
}

/** Resolve a ticket without blocking on full queue sync. */
export async function resolveTicketById(ticketId: string): Promise<QueueTicket | null> {
  const cached = resolveTicketFromStore(ticketId)
  if (cached) return cached

  const numericId = Number(ticketId)
  if (Number.isNaN(numericId)) return null

  try {
    const apiTicket = await ticketsApi.getById(numericId)
    return mapTicketFromApi(apiTicket)
  } catch {
    return null
  }
}
