import type { ApiDepartment, ApiTicket } from './types'
import type { QueueTicket, ServiceInfo, TicketStatus } from '@/types'
import { calculateWaitTime } from '@/lib/queue/engine'

function mapStatus(status: ApiTicket['status']): TicketStatus {
  if (status === 'done' || (status as string) === 'completed') return 'completed'
  return status as TicketStatus
}

export function mapDepartmentToService(dept: ApiDepartment): ServiceInfo {
  return {
    type: dept.slug,
    label: dept.name,
    description: dept.description ?? '',
    icon: '',
    color: 'sage',
    avgServiceMinutes: dept.avgServiceMinutes ?? 5,
    departmentId: dept.id,
  }
}

export function mapTicketFromApi(ticket: ApiTicket): QueueTicket {
  const serviceType = ticket.department?.slug ?? 'consultation'
  const avgServiceMinutes = ticket.department?.avgServiceMinutes ?? 5
  const status = mapStatus(ticket.status)
  const position =
    status === 'serving' ? 1 : (status === 'completed' || status === 'done' || status === 'cancelled') ? 0 : Math.max(1, ticket.position)

  const createdAt = new Date(ticket.bookedAt).getTime()
  const servingStartedAt = ticket.servingStartedAt
    ? new Date(ticket.servingStartedAt).getTime()
    : null   // never fall back to createdAt — backend sets this only when truly serving
  const updatedAt = ticket.servedAt
    ? new Date(ticket.servedAt).getTime()
    : servingStartedAt ?? createdAt

  const estimatedWaitMinutes =
    status === 'serving'
      ? 0
      : status === 'waiting' && position === 1
        ? 0
        : calculateWaitTime(position, serviceType, avgServiceMinutes)

  return {
    id: String(ticket.id),
    ticketNumber: ticket.ticketNumber,
    serviceType,
    status,
    position,
    estimatedWaitMinutes,
    avgServiceMinutes,
    patientName: ticket.patientName?.trim() || 'Anonymous User',
    createdAt,
    updatedAt,
    servingStartedAt,
    synced: true,
    isSimulated: false,
    patientId: (ticket as any).patientId ?? null,
    deferred: (ticket as any).deferred ?? false,
  }
}

export function slugFromLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export function acronymFromLabel(label: string): string {
  const letters = label.replace(/[^a-zA-Z]/g, '').toUpperCase()
  if (letters.length >= 3) return letters.slice(0, 3)
  return (letters + 'XXX').slice(0, 3)
}
