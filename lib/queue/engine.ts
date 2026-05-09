import { v4 as uuidv4 } from 'uuid'
import { getNextTicketNumber, saveTicket, getAllTickets, saveAllTickets } from '@/lib/db/idb'
import type { QueueTicket, ServiceType, ServiceInfo } from '@/types'

export const SERVICE_CONFIG: Record<ServiceType, ServiceInfo> = {
  consultation: {
    type: 'consultation',
    label: 'Consultation',
    description: 'See a doctor for diagnosis and treatment',
    icon: '',
    color: 'sage',
    avgServiceMinutes: 4,
  },
  laboratory: {
    type: 'laboratory',
    label: 'Laboratory',
    description: 'Blood tests, urine tests, and lab work',
    icon: '',
    color: 'sage',
    avgServiceMinutes: 5,
  },
  pharmacy: {
    type: 'pharmacy',
    label: 'Pharmacy',
    description: 'Collect your prescribed medications',
    icon: '',
    color: 'sage',
    avgServiceMinutes: 3,
  },
  radiology: {
    type: 'radiology',
    label: 'Radiology',
    description: 'X-rays, MRI, CT scans and imaging',
    icon: '',
    color: 'sage',
    avgServiceMinutes: 6,
  },
}

export function calculateWaitTime(position: number, serviceType: ServiceType): number {
  if (position <= 1) return 0

  let avgMinutes = 5

  if (SERVICE_CONFIG[serviceType]) {
    avgMinutes = SERVICE_CONFIG[serviceType].avgServiceMinutes
  } else if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem('hospital_services')
      if (stored) {
        const services: ServiceInfo[] = JSON.parse(stored)
        const svc = services.find((s: ServiceInfo) => s.type === serviceType)
        if (svc?.avgServiceMinutes) {
          avgMinutes = svc.avgServiceMinutes
        }
      }
    } catch (e) {
      // fallback applies safely
    }
  }

  return (position - 1) * avgMinutes
}


export async function createNewTicket(
  serviceType: ServiceType,
  patientName: string
): Promise<QueueTicket> {
  const existingTickets = await getAllTickets()
  const serviceTickets = existingTickets.filter(
    t => t.serviceType === serviceType && t.status !== 'completed'
  )

  const position = serviceTickets.length + 1
  const ticketNumber = await getNextTicketNumber(serviceType)

  const ticket: QueueTicket = {
    id: uuidv4(),
    ticketNumber,
    serviceType,
    status: 'waiting',
    position,
    estimatedWaitMinutes: calculateWaitTime(position, serviceType),
    patientName: patientName.trim() || 'Anonymous',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    synced: false,
    isSimulated: false,
  }

  await saveTicket(ticket)
  return ticket
}

export async function advanceQueueInDB(serviceType: ServiceType): Promise<QueueTicket[]> {
  const allTickets = await getAllTickets()
  const serviceTickets = allTickets
    .filter(t => t.serviceType === serviceType)
    .sort((a, b) => a.createdAt - b.createdAt)

  const first = serviceTickets.find(t => t.position === 1)
  if (!first) return serviceTickets

  const now = Date.now()
  const updated = serviceTickets.map(ticket => {
    if (ticket.id === first.id) {
      return { ...ticket, status: 'completed' as const, position: 0, updatedAt: now }
    }
    if (ticket.status === 'waiting' || ticket.status === 'serving') {
      const newPosition = ticket.position - 1
      return {
        ...ticket,
        position: newPosition,
        status: newPosition === 1 ? 'serving' as const : 'waiting' as const,
        estimatedWaitMinutes: calculateWaitTime(newPosition, serviceType),
        updatedAt: now,
      }
    }
    return ticket
  })

  await saveAllTickets(updated)
  return updated
}

export function recalculatePositions(tickets: QueueTicket[]): QueueTicket[] {
  const active = tickets
    .filter(t => t.status !== 'completed')
    .sort((a, b) => a.createdAt - b.createdAt)

  const grouped: Record<string, QueueTicket[]> = {}
  active.forEach(t => {
    if (!grouped[t.serviceType]) grouped[t.serviceType] = []
    grouped[t.serviceType].push(t)
  })

  const result: QueueTicket[] = []

  for (const type in grouped) {
    const list = grouped[type]
    const avgMinutes = SERVICE_CONFIG[type as ServiceType]?.avgServiceMinutes || 5
    const maxServiceMs = avgMinutes * 60 * 1000

    list.forEach((ticket, index) => {
      const timeSinceCreated = Date.now() - ticket.createdAt
      const isNewFirst = index === 0 && timeSinceCreated < 4000

      const isStale = index === 0 && timeSinceCreated > maxServiceMs * 1.1

      result.push({
        ...ticket,
        position: index + 1,
        status: isStale ? 'completed' : (isNewFirst ? 'waiting' : (index === 0 ? 'serving' : 'waiting')),
        estimatedWaitMinutes: calculateWaitTime(index + 1, ticket.serviceType),
      })
    })
  }

  return result
}