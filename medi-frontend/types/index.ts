export type ServiceType = string

export type TicketStatus = 'waiting' | 'serving' | 'done' | 'completed' | 'cancelled'

export type SyncAction = 'CREATE_TICKET' | 'UPDATE_STATUS'

export interface QueueTicket {
  id: string
  ticketNumber: string
  serviceType: ServiceType
  status: TicketStatus
  position: number
  estimatedWaitMinutes: number
  /** From department.avgServiceMinutes — how long a serving slot lasts */
  avgServiceMinutes: number
  patientName: string
  createdAt: number
  updatedAt: number
  servingStartedAt: number | null
  synced: boolean
  isSimulated: boolean
  patientId: string | null
  deferred: boolean
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
  departmentId?: number
}

export interface ServiceCounter {
  serviceType: ServiceType
  count: number
}

export interface QueueStoreState {
  myTicket: QueueTicket | null        // compat getter → first active non-deferred ticket
  myTickets: QueueTicket[]            // all tickets belonging to this patient session
  patientId: string | null            // persisted session UUID
  allTickets: QueueTicket[]
  pendingSync: OutboxEntry[]
  isLoading: boolean
  isCreating: boolean
  initializeQueue: (serviceType: ServiceType) => Promise<void>
  createTicket: (serviceType: ServiceType, patientName: string) => Promise<QueueTicket | null>
  chooseServingTicket: (ticketId: string) => Promise<boolean>
  advanceQueue: (serviceType: ServiceType) => Promise<void>
  setTicketStatus: (id: string, status: TicketStatus) => void
  loadFromStorage: () => Promise<void>
  syncFromApi: () => Promise<boolean>
  useApi: boolean
  apiError: string | null
  addToOutbox: (entry: OutboxEntry) => void
  removeFromOutbox: (id: string) => void
  clearMyTicket: () => void
  clearAllTickets: () => void
  resetSystem: () => Promise<void>
}

export interface NetworkStoreState {
  isOnline: boolean
  lastOnlineAt: number | null
  setOnline: (val: boolean) => void
}