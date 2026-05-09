export type ServiceType = string

export type TicketStatus = 'waiting' | 'serving' | 'completed' | 'cancelled'

export type SyncAction = 'CREATE_TICKET' | 'UPDATE_STATUS'

export interface QueueTicket {
  id: string
  ticketNumber: string
  serviceType: ServiceType
  status: TicketStatus
  position: number
  estimatedWaitMinutes: number
  patientName: string
  createdAt: number
  updatedAt: number
  synced: boolean
  isSimulated: boolean
}

export interface OutboxEntry {
  id: string
  action: SyncAction
  payload: Partial<QueueTicket>
  createdAt: number
  retryCount: number
  lastError?: string
}

export interface ServiceInfo {
  type: ServiceType
  label: string
  description: string
  icon: string
  color: string
  avgServiceMinutes: number
}

export interface ServiceCounter {
  serviceType: ServiceType
  count: number
}

export interface QueueStoreState {
  myTicket: QueueTicket | null
  allTickets: QueueTicket[]
  pendingSync: OutboxEntry[]
  isLoading: boolean
  isCreating: boolean
  initializeQueue: (serviceType: ServiceType) => Promise<void>
  createTicket: (serviceType: ServiceType, patientName: string) => Promise<QueueTicket | null>
  advanceQueue: (serviceType: ServiceType) => Promise<void>
  setTicketStatus: (id: string, status: TicketStatus) => void
  loadFromStorage: () => Promise<void>
  addToOutbox: (entry: OutboxEntry) => void
  removeFromOutbox: (id: string) => void
  clearMyTicket: () => void
}

export interface NetworkStoreState {
  isOnline: boolean
  lastOnlineAt: number | null
  setOnline: (val: boolean) => void
}