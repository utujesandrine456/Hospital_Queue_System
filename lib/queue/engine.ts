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
    avgServiceMinutes: 1, // Default 1 min
  },
}

export function calculateWaitTime(position: number, serviceType: ServiceType): number {
  if (position <= 1) return 0

  let avgMinutes = 5

  // 1. Check LocalStorage first for dynamic user overrides
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem('hospital_services')
      if (stored) {
        const services: ServiceInfo[] = JSON.parse(stored)
        const svc = services.find((s: ServiceInfo) => s.type === serviceType)
        if (svc?.avgServiceMinutes) {
          return (position - 1) * svc.avgServiceMinutes
        }
      }
    } catch (e) {
    }
  }

  // 2. Fallback to hardcoded SERVICE_CONFIG
  if (SERVICE_CONFIG[serviceType]) {
    avgMinutes = SERVICE_CONFIG[serviceType].avgServiceMinutes
  }

  return (position - 1) * avgMinutes
}

async function generateSimulatedPatients(
  serviceType: ServiceType,
  count: number
): Promise<QueueTicket[]> {
  const fakePatients = [
    'Alice Uwase',
    'Jean Mugisha',
    'Kevin Ntwari',
    'Solange Irakoze',
    'Hope Uwineza',
  ]
  const tickets: QueueTicket[] = []
  const now = Date.now()

  // Stagger arrival times based on service duration
  const serviceDurationMinutes = calculateWaitTime(2, serviceType) || 5
  const serviceDurationMs = serviceDurationMinutes * 60 * 1000

  for (let i = 0; i < count; i++) {
    const ticketNumber = await getNextTicketNumber(serviceType)
    // Stagger backwards so they appear to have arrived earlier
    const createdAt = now - (count - i) * serviceDurationMs

    const ticket: QueueTicket = {
      id: uuidv4(),
      ticketNumber,
      serviceType,
      status: 'waiting',
      position: i + 1,
      estimatedWaitMinutes: calculateWaitTime(i + 1, serviceType),
      patientName: fakePatients[Math.floor(Math.random() * fakePatients.length)],
      createdAt,
      updatedAt: now,
      servingStartedAt: null,
      synced: true,
      isSimulated: true,
    }
    tickets.push(ticket)
  }

  return tickets
}


export async function createNewTicket(
  serviceType: ServiceType,
  patientName: string
): Promise<QueueTicket> {
  const existingTickets = await getAllTickets()
  let activeServiceTickets = existingTickets.filter(
    t => t.serviceType === serviceType && t.status !== 'completed'
  )

  // DEMO MODE: If queue is empty, generate 2-3 simulated patients first
  if (activeServiceTickets.length === 0) {
    const count = Math.floor(Math.random() * 2) + 2
    const fakeOnes = await generateSimulatedPatients(serviceType, count)
    await saveAllTickets(fakeOnes)
    activeServiceTickets = [...fakeOnes]
  }

  const position = activeServiceTickets.length + 1
  const ticketNumber = await getNextTicketNumber(serviceType)

  const ticket: QueueTicket = {
    id: uuidv4(),
    ticketNumber,
    serviceType,
    status: 'waiting',
    position,
    estimatedWaitMinutes: calculateWaitTime(position, serviceType),
    patientName: patientName.trim() || 'Anonymous User',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    servingStartedAt: null,
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
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => a.createdAt - b.createdAt)

  const grouped: Record<string, QueueTicket[]> = {}
  active.forEach(t => {
    if (!grouped[t.serviceType]) grouped[t.serviceType] = []
    grouped[t.serviceType].push(t)
  })

  const result: QueueTicket[] = []
  const now = Date.now()

  for (const type in grouped) {
    const list = grouped[type]

    const avgMinutes = calculateWaitTime(2, type as ServiceType) || 5
    const serviceMs = avgMinutes * 60 * 1000

    list.forEach((ticket, index) => {
      let status = ticket.status
      let servingStartedAt = ticket.servingStartedAt
      let isStale = false

      if (index === 0) {
        status = 'serving'

        if (!servingStartedAt) {
          servingStartedAt = now
        }
        const elapsedSinceServiceStart = now - servingStartedAt
        if (elapsedSinceServiceStart > serviceMs) {
          isStale = true
          status = 'completed'
        }
      } else {
        status = 'waiting'
        servingStartedAt = null
      }

      result.push({
        ...ticket,
        position: index + 1,
        status: isStale ? 'completed' : status,
        servingStartedAt,
        estimatedWaitMinutes: calculateWaitTime(index + 1, ticket.serviceType),
        updatedAt: now,
      })
    })
  }

  const terminal = tickets.filter(t => t.status === 'completed' || t.status === 'cancelled')
  return [...result, ...terminal]
}