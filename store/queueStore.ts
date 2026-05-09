import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAllTickets, saveTicket, saveAllTickets } from '@/lib/db/idb'
import { createNewTicket, recalculatePositions, calculateWaitTime } from '@/lib/queue/engine'
import { queueOutboxAction } from '@/lib/sync/outbox'
import type { QueueStoreState, QueueTicket, ServiceType, TicketStatus, OutboxEntry } from '@/types'

export const useQueueStore = create<QueueStoreState>()(
  persist(
    (set, get) => ({
      myTicket: null,
      allTickets: [],
      pendingSync: [],
      isLoading: false,
      isCreating: false,

      loadFromStorage: async () => {
        try {
          const tickets = await getAllTickets()
          const activeTickets = tickets.filter(t => t.status !== 'completed')
          const recalculated = recalculatePositions(activeTickets)
          const completed = tickets.filter(t => t.status === 'completed')
          const allRecalculated = [...recalculated, ...completed]

          const currentMyTicket = get().myTicket
          const updatedMyTicket = currentMyTicket
            ? allRecalculated.find(t => t.id === currentMyTicket.id) || null
            : null

          set({
            allTickets: allRecalculated,
            myTicket: updatedMyTicket,
          })
        } catch (err) {
          console.error('[Store] Failed to load from storage:', err)
        }
      },

      initializeQueue: async (serviceType: ServiceType) => {
        set({ isLoading: true })
        try {
          // In production, we don't generate fake patients anymore
          await get().loadFromStorage()
        } catch (err) {
          console.error('[Store] Failed to initialize queue:', err)
        } finally {
          set({ isLoading: false })
        }
      },

      createTicket: async (serviceType: ServiceType, patientName: string) => {
        if (get().isCreating) return null

        set({ isCreating: true })

        try {
          await get().initializeQueue(serviceType)

          const ticket = await createNewTicket(serviceType, patientName)

          await queueOutboxAction('CREATE_TICKET', ticket)

          const current = get().allTickets
          set({
            myTicket: ticket,
            allTickets: [...current, ticket],
          })

          const pendingEntry: OutboxEntry = {
            id: ticket.id,
            action: 'CREATE_TICKET',
            payload: ticket,
            createdAt: Date.now(),
            retryCount: 0,
          }
          set(state => ({ pendingSync: [...state.pendingSync, pendingEntry] }))

          return ticket
        } catch (err) {
          console.error('[Store] Failed to create ticket:', err)
          return null
        } finally {
          set({ isCreating: false })
        }
      },

      advanceQueue: async (serviceType: ServiceType) => {
        const current = get().allTickets

        const serviceTickets = current.filter(t => t.serviceType === serviceType)
        const serving = serviceTickets.find(t => t.position === 1 && !t.isSimulated)
          || serviceTickets.find(t => t.position === 1)

        if (!serving) return

        const now = Date.now()

        const updated = current.map(ticket => {
          if (ticket.serviceType !== serviceType) return ticket;

          if (ticket.id === serving.id) {
            return { ...ticket, status: 'completed' as TicketStatus, position: 0, updatedAt: now }
          }
          if (ticket.status !== 'completed') {
            const newPos = ticket.position - 1
            return {
              ...ticket,
              position: newPos,
              status: newPos === 1 ? 'serving' as TicketStatus : 'waiting' as TicketStatus,
              updatedAt: now,
              estimatedWaitMinutes: calculateWaitTime(newPos, ticket.serviceType),
            }
          }
          return ticket
        })

        const currentMyTicket = get().myTicket
        const updatedMyTicket = currentMyTicket
          ? updated.find(t => t.id === currentMyTicket.id) ?? currentMyTicket
          : null

        set({ allTickets: updated, myTicket: updatedMyTicket })

        await saveAllTickets(updated)
      },

      setTicketStatus: async (id: string, status: TicketStatus) => {
        const updated = get().allTickets.map(t =>
          t.id === id ? { ...t, status, updatedAt: Date.now() } : t
        )
        const myTicket = get().myTicket
        set({
          allTickets: updated,
          myTicket: myTicket?.id === id
            ? { ...myTicket, status, updatedAt: Date.now() }
            : myTicket,
        })
        const ticket = updated.find(t => t.id === id)
        if (ticket) await saveTicket(ticket)
      },

      addToOutbox: (entry: OutboxEntry) => {
        set(state => ({ pendingSync: [...state.pendingSync, entry] }))
      },

      removeFromOutbox: (id: string) => {
        set(state => ({
          pendingSync: state.pendingSync.filter(e => e.id !== id),
        }))
      },

      clearMyTicket: () => set({ myTicket: null }),
    }),
    {
      name: 'hospital-queue-store',
      partialize: (state) => ({ myTicket: state.myTicket }),
    }
  )
)