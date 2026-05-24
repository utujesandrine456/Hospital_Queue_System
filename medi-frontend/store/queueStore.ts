import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { recalculatePositions } from '@/lib/queue/engine'
import { checkApiHealth, ApiError } from '@/lib/api/client'
import { ticketsApi } from '@/lib/api/tickets'
import { mapTicketFromApi } from '@/lib/api/mappers'
import { fetchTicketsFromApi } from '@/lib/api/sync'
import { useServiceStore } from '@/store/serviceStore'
import { useAuthStore } from '@/store/authStore'
import type { QueueStoreState, QueueTicket, ServiceType, TicketStatus } from '@/types'

export class BackendUnavailableError extends Error {
  constructor(message = 'Cannot reach the hospital server. Start medi-backend on port 2000.') {
    super(message)
    this.name = 'BackendUnavailableError'
  }
}

async function requireApi(): Promise<void> {
  const ok = await checkApiHealth()
  if (!ok) throw new BackendUnavailableError()
}

export const useQueueStore = create<QueueStoreState>()(
  persist(
    (set, get) => ({
      myTicket: null,
      allTickets: [],
      pendingSync: [],
      isLoading: false,
      isCreating: false,
      useApi: true,
      apiError: null as string | null,

      syncFromApi: async () => {
        try {
          await requireApi()
          const tickets = await fetchTicketsFromApi()
          const myTicket = get().myTicket
          const updatedMyTicket = myTicket
            ? tickets.find(t => t.id === myTicket.id) ?? myTicket
            : null

          set({ allTickets: tickets, myTicket: updatedMyTicket, useApi: true, apiError: null })
          return true
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to load queue from server'
          set({ apiError: message, useApi: false })
          console.error('[Store] API sync failed:', err)
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
          await requireApi()
          await useServiceStore.getState().loadServices()

          const departmentId = useServiceStore.getState().getDepartmentId(serviceType)
          if (!departmentId) {
            throw new Error(`No department configured for "${serviceType}". Check PostgreSQL seed data.`)
          }

          const apiTicket = await ticketsApi.create({
            departmentId,
            patientName: patientName.trim() || 'Anonymous User',
          })

          const ticket = mapTicketFromApi(apiTicket)
          set({ myTicket: ticket })
          await get().syncFromApi()
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

      advanceQueue: async (serviceType: ServiceType) => {
        const departmentId = useServiceStore.getState().getDepartmentId(serviceType)
        const token = useAuthStore.getState().getToken()

        if (!token) throw new Error('Admin sign-in required')
        if (!departmentId) throw new Error(`Unknown department: ${serviceType}`)

        await requireApi()
        await ticketsApi.callNext(departmentId, token)
        await get().syncFromApi()
      },

      setTicketStatus: async (id: string, status: TicketStatus) => {
        const token = useAuthStore.getState().getToken()
        const numericId = Number(id)

        if (status === 'cancelled' && token && !Number.isNaN(numericId)) {
          await requireApi()
          await ticketsApi.cancel(numericId, token)
          await get().syncFromApi()
        }
      },

      addToOutbox: () => {},

      removeFromOutbox: () => {},

      clearMyTicket: () => set({ myTicket: null }),

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
      partialize: state => ({ myTicket: state.myTicket }),
    },
  ),
)
