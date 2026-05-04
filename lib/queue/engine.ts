import { v4 as uuidv4 } from 'uuid'
import { getNextTicketNumber, saveTicket, getAllTickets, saveAllTickets } from '@/lib/db/idb'
import type { QueueTicket, ServiceType, ServiceInfo } from '@/types'

export const SERVICE_CONFIG: Record<ServiceType, ServiceInfo> = {
  consultation: {
    type: 'consultation',
    label: 'Consultation',
    description: 'See a doctor for diagnosis and treatment',
    icon: '', // Handled by Lucide
    color: 'sage',
    avgServiceMinutes: 8,
  },
  laboratory: {
    type: 'laboratory',
    label: 'Laboratory',
    description: 'Blood tests, urine tests, and lab work',
    icon: '', // Handled by Lucide
    color: 'sage',
    avgServiceMinutes: 5,
  },
  pharmacy: {
    type: 'pharmacy',
    label: 'Pharmacy',
    description: 'Collect your prescribed medications',
    icon: '', // Handled by Lucide
    color: 'sage',
    avgServiceMinutes: 3,
  },
  radiology: {
    type: 'radiology',
    label: 'Radiology',
    description: 'X-rays, MRI, CT scans and imaging',
    icon: '', // Handled by Lucide
    color: 'sage',
    avgServiceMinutes: 12,
  },
}

export function calculateWaitTime(position: number, serviceType: ServiceType): number {
  if (position <= 1) return 0
  const avgMinutes = SERVICE_CONFIG[serviceType].avgServiceMinutes
  // Real-world wait often scales with position but has a base floor
  return (position - 1) * avgMinutes
}

export async function generateSimulatedPatients(
  serviceType: ServiceType,
  count: number = 6
): Promise<QueueTicket[]> {
  const names = [
    'Patient A', 'Patient B', 'Patient C', 'Patient D',
    'Patient E', 'Patient F', 'Patient G', 'Patient H',
    'Patient I', 'Patient J',
  ]

  const simulated: QueueTicket[] = []
  const baseTime = Date.now() - (count * 2 * 60 * 1000)

  for (let i = 0; i < count; i++) {
    const ticketNumber = await getNextTicketNumber(serviceType)
    const position = i + 1
    const createdAt = baseTime + (i * 2 * 60 * 1000)

    const ticket: QueueTicket = {
      id: uuidv4(),
      ticketNumber,
      serviceType,
      status: position === 1 ? 'serving' : 'waiting',
      position,
      estimatedWaitMinutes: calculateWaitTime(position, serviceType),
      patientName: names[i % names.length],
      createdAt,
      updatedAt: createdAt,
      synced: true,
      isSimulated: true,
    }

    simulated.push(ticket)
    await saveTicket(ticket)
  }

  return simulated
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

  return active.map((ticket, index) => ({
    ...ticket,
    position: index + 1,
    status: index === 0 ? 'serving' as const : 'waiting' as const,
    estimatedWaitMinutes: calculateWaitTime(index + 1, ticket.serviceType),
  }))
}