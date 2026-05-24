import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { QueueTicket, OutboxEntry, ServiceCounter, ServiceType } from '@/types'

interface HospitalQueueDB extends DBSchema {
  tickets: {
    key: string
    value: QueueTicket
    indexes: {
      'by-service': ServiceType
      'by-status': string
      'by-created': number
    }
  }
  outbox: {
    key: string
    value: OutboxEntry
  }
  counters: {
    key: ServiceType
    value: ServiceCounter
  }
}

let dbInstance: IDBPDatabase<HospitalQueueDB> | null = null

export async function getDB(): Promise<IDBPDatabase<HospitalQueueDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<HospitalQueueDB>('hospital-queue-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tickets')) {
        const ticketStore = db.createObjectStore('tickets', { keyPath: 'id' })
        ticketStore.createIndex('by-service', 'serviceType')
        ticketStore.createIndex('by-status', 'status')
        ticketStore.createIndex('by-created', 'createdAt')
      }
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('counters')) {
        db.createObjectStore('counters', { keyPath: 'serviceType' })
      }
    },
  })

  return dbInstance
}