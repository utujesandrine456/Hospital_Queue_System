import { ticketsApi } from './tickets'
import { mapTicketFromApi } from './mappers'
import { recalculatePositions } from '@/lib/queue/engine'
import type { QueueTicket } from '@/types'
import { useAuthStore } from '@/store/authStore'

export async function fetchTicketsFromApi(): Promise<QueueTicket[]> {
  const token = useAuthStore.getState().getToken()

  const apiTickets = token
    ? await ticketsApi.getRecentForAdmin(token)
    : await ticketsApi.getAllActive()

  const mapped = apiTickets.map(mapTicketFromApi)
  const active = mapped.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
  const terminal = mapped.filter(t => t.status === 'completed' || t.status === 'cancelled')
  return [...recalculatePositions(active), ...terminal]
}
