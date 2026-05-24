import { ticketsApi } from './tickets'
import { mapTicketFromApi } from './mappers'
import type { QueueTicket } from '@/types'
import { useAuthStore } from '@/store/authStore'

function sortActiveTickets(tickets: QueueTicket[]): QueueTicket[] {
  return [...tickets].sort(
    (a, b) => a.position - b.position || a.createdAt - b.createdAt,
  )
}

/** Load tickets from PostgreSQL via API — positions come from the server, not local simulation. */
export async function fetchTicketsFromApi(): Promise<QueueTicket[]> {
  const token = useAuthStore.getState().getToken()

  const apiTickets = token
    ? await ticketsApi.getRecentForAdmin(token)
    : await ticketsApi.getAllActive()

  const mapped = apiTickets.map(mapTicketFromApi)
  const active = sortActiveTickets(
    mapped.filter(t => t.status !== 'completed' && t.status !== 'cancelled'),
  )
  const terminal = mapped
    .filter(t => t.status === 'completed' || t.status === 'cancelled')
    .sort((a, b) => b.createdAt - a.createdAt)

  return [...active, ...terminal]
}

/** Active queue for one department (patient ticket view). */
export async function fetchDepartmentQueue(departmentId: number): Promise<QueueTicket[]> {
  const apiTickets = await ticketsApi.getQueue(departmentId)
  return sortActiveTickets(apiTickets.map(mapTicketFromApi))
}

/** Merge store tickets with the current patient ticket so the queue panel is never empty incorrectly. */
export function mergeServiceQueue(
  tickets: QueueTicket[],
  current: QueueTicket,
): QueueTicket[] {
  const active = tickets.filter(
    t =>
      t.serviceType === current.serviceType &&
      t.status !== 'completed' &&
      t.status !== 'cancelled',
  )

  const hasCurrent = active.some(t => t.id === current.id)
  const merged = hasCurrent ? active : [...active, current]

  return sortActiveTickets(merged)
}
