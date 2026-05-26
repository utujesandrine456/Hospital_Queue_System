import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { checkApiHealth, ApiError } from '@/lib/api/client'
import { ticketsApi } from '@/lib/api/tickets'
import { mapTicketFromApi } from '@/lib/api/mappers'
import { fetchTicketsFromApi } from '@/lib/api/sync'
import { useServiceStore } from '@/store/serviceStore'
import { useAuthStore } from '@/store/authStore'
import type { QueueStoreState, QueueTicket, ServiceType, TicketStatus } from '@/types'

export const API_UNAVAILABLE_MESSAGE =
  'Cannot reach the hospital server. Start medi-backend on port 2000.'

async function isApiAvailable(): Promise<boolean> {
  return checkApiHealth()
}

function generatePatientId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `pid-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const useQueueStore = create<QueueStoreState>()(
  persist(
    (set, get) => ({
      // ---------- state ----------
      myTickets: [] as QueueTicket[],
      patientId: null as string | null,
      allTickets: [],
      pendingSync: [],
      isLoading: false,
      isCreating: false,
      useApi: true,
      apiError: null as string | null,

      // ---------- compat getter ----------
      get myTicket(): QueueTicket | null {
        const { myTickets } = get()
        return (
          myTickets.find(t => !t.deferred && (t.status === 'waiting' || t.status === 'serving')) ??
          myTickets[0] ??
          null
        )
      },

      // ---------- sync ----------
      syncFromApi: async () => {
        try {
          if (!(await isApiAvailable())) {
            set({ apiError: API_UNAVAILABLE_MESSAGE, useApi: false })
            return false
          }

          const tickets = await fetchTicketsFromApi()
          const { patientId, myTickets } = get()

          // Refresh myTickets from the server using patientId
          let updatedMyTickets: QueueTicket[] = myTickets
          if (patientId) {
            try {
              const patientApiTickets = await ticketsApi.getByPatient(patientId)
              updatedMyTickets = patientApiTickets.map(mapTicketFromApi)
            } catch {
              // Fall back to matching by ID
              const myIds = new Set(myTickets.map(t => t.id))
              updatedMyTickets = tickets.filter(t => myIds.has(t.id))
            }
          }

          set({ allTickets: tickets, myTickets: updatedMyTickets, useApi: true, apiError: null })
          return true
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to load queue from server'
          set({ apiError: message, useApi: false })
          return false
        }
      },

      loadFromStorage: async () => {
        set({ isLoading: true })
        try {
          await get().syncFromApi()
        } finally {
          set({ isLoading: false })
        }
      },

      initializeQueue: async (_serviceType: ServiceType) => {
        await get().loadFromStorage()
      },

      createTicket: async (serviceType: ServiceType, patientName: string) => {
        if (get().isCreating) return null
        set({ isCreating: true, apiError: null })

        try {
          if (!(await isApiAvailable())) {
            set({ apiError: API_UNAVAILABLE_MESSAGE, useApi: false })
            return null
          }

          await useServiceStore.getState().loadServices()

          const departmentId = useServiceStore.getState().getDepartmentId(serviceType)
          if (!departmentId) {
            throw new Error(`No department configured for "${serviceType}". Check PostgreSQL seed data.`)
          }

          // Ensure we have a stable patientId for this session
          let { patientId } = get()
          if (!patientId) {
            patientId = generatePatientId()
            set({ patientId })
          }

          const apiTicket = await ticketsApi.create({
            departmentId,
            patientName: patientName.trim() || 'Anonymous User',
            patientId,
          } as any)

          const ticket = mapTicketFromApi(apiTicket)
          const synced = await get().syncFromApi()

          if (!synced) {
            // Local fallback — add to myTickets
            const existing = get().myTickets
            const updated = [...existing.filter(t => t.id !== ticket.id), ticket]
            set({ myTickets: updated })
          }

          return ticket
        } catch (err) {
          const message =
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : 'Failed to create ticket'
          set({ apiError: message })
          console.error('[Store] Failed to create ticket:', err)
          return null
        } finally {
          set({ isCreating: false })
        }
      },

      chooseServingTicket: async (ticketId: string) => {
        const { patientId } = get()
        const numericId = Number(ticketId)
        if (!patientId || Number.isNaN(numericId)) {
          return false
        }

        try {
          if (!(await isApiAvailable())) {
            set({ apiError: API_UNAVAILABLE_MESSAGE, useApi: false })
            return false
          }

          await ticketsApi.chooseServingTicket(patientId, numericId)
          await get().syncFromApi()
          return true
        } catch (err) {
          const message =
            err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : 'Failed to choose active service'
          set({ apiError: message })
          console.error('[Store] Failed to choose active service:', err)
          return false
        }
      },

      advanceQueue: async (serviceType: ServiceType) => {
        const departmentId = useServiceStore.getState().getDepartmentId(serviceType)
        const token = useAuthStore.getState().getToken()

        if (!token) throw new Error('Admin sign-in required')
        if (!departmentId) throw new Error(`Unknown department: ${serviceType}`)

        if (!(await isApiAvailable())) {
          set({ apiError: API_UNAVAILABLE_MESSAGE, useApi: false })
          return
        }

        await ticketsApi.callNext(departmentId, token)
        await get().syncFromApi()
      },

      setTicketStatus: async (id: string, status: TicketStatus) => {
        const token = useAuthStore.getState().getToken()
        const numericId = Number(id)

        if (status === 'cancelled' && token && !Number.isNaN(numericId)) {
          if (!(await isApiAvailable())) {
            set({ apiError: API_UNAVAILABLE_MESSAGE, useApi: false })
            return
          }
          await ticketsApi.cancel(numericId, token)
          await get().syncFromApi()
        }
      },

      addToOutbox: () => { },
      removeFromOutbox: () => { },

      clearMyTicket: () => {
        // Legacy compat: clears the first active ticket only
        const { myTickets } = get()
        const active = myTickets.find(
          t => !t.deferred && (t.status === 'waiting' || t.status === 'serving'),
        )
        if (active) {
          set({ myTickets: myTickets.filter(t => t.id !== active.id) })
        } else {
          set({ myTickets: [] })
        }
      },

      clearAllTickets: () => set({ myTickets: [], patientId: null }),

      resetSystem: async () => {
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
          try {
            window.indexedDB.deleteDatabase('hospital-queue-db')
          } catch {
            /* legacy cache */
          }
          window.location.href = '/'
        }
      },
    }),
    {
      name: 'hospital-queue-store',
      partialize: state => ({ myTickets: state.myTickets, patientId: state.patientId }),
    },
  ),
)
