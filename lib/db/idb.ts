import { getDB } from './schema'
import type { QueueTicket, OutboxEntry, ServiceType } from '@/types'

export async function saveTicket(ticket: QueueTicket): Promise<void> {
  const db = await getDB()
  await db.put('tickets', ticket)
}

export async function getTicket(id: string): Promise<QueueTicket | undefined> {
  if (!id) return undefined
  const db = await getDB()
  return db.get('tickets', id)
}

export async function getAllTickets(): Promise<QueueTicket[]> {
  const db = await getDB()
  const tickets = await db.getAllFromIndex('tickets', 'by-created')
  return tickets.sort((a, b) => a.createdAt - b.createdAt)
}

export async function getTicketsByService(serviceType: ServiceType): Promise<QueueTicket[]> {
  const db = await getDB()
  const tickets = await db.getAllFromIndex('tickets', 'by-service', serviceType)
  return tickets.sort((a, b) => a.createdAt - b.createdAt)
}

export async function updateTicketStatus(
  id: string,
  updates: Partial<Pick<QueueTicket, 'status' | 'position' | 'estimatedWaitMinutes' | 'synced'>>
): Promise<void> {
  if (!id) return
  const db = await getDB()
  const existing = await db.get('tickets', id)
  if (!existing) return
  await db.put('tickets', { ...existing, ...updates, updatedAt: Date.now() })
}

export async function saveAllTickets(tickets: QueueTicket[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('tickets', 'readwrite')
  await Promise.all([
    ...tickets.map(ticket => tx.store.put(ticket)),
    tx.done,
  ])
}

export async function deleteTicket(id: string): Promise<void> {
  if (!id) return
  const db = await getDB()
  await db.delete('tickets', id)
}

export async function getNextTicketNumber(serviceType: ServiceType): Promise<string> {
  const db = await getDB()

  const prefixMap: Record<ServiceType, string> = {
    consultation: 'CON',
    laboratory: 'LAB',
    pharmacy: 'PHM',
    radiology: 'RAD',
  }

  const prefix = prefixMap[serviceType]
  const existing = await db.get('counters', serviceType)
  const currentCount = existing?.count ?? 0
  const nextCount = currentCount + 1

  await db.put('counters', { serviceType, count: nextCount })

  const formatted = String(nextCount).padStart(3, '0')
  return `${prefix}-${formatted}`
}

export async function getCurrentCounter(serviceType: ServiceType): Promise<number> {
  const db = await getDB()
  const existing = await db.get('counters', serviceType)
  return existing?.count ?? 0
}

export async function addOutboxEntry(entry: OutboxEntry): Promise<void> {
  const db = await getDB()
  await db.put('outbox', entry)
}

export async function getOutboxEntries(): Promise<OutboxEntry[]> {
  const db = await getDB()
  return db.getAll('outbox')
}

export async function removeOutboxEntry(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('outbox', id)
}

export async function updateOutboxEntry(id: string, updates: Partial<OutboxEntry>): Promise<void> {
  const db = await getDB()
  const existing = await db.get('outbox', id)
  if (!existing) return
  await db.put('outbox', { ...existing, ...updates })
}

export async function clearOutbox(): Promise<void> {
  const db = await getDB()
  await db.clear('outbox')
}