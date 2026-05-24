'use client'

import { useQueueStore } from '@/store/queueStore'
import { useNetworkStore } from '@/store/networkStore'
import type { ServiceType } from '@/types'

export function useQueue() {
  const {
    myTicket,
    allTickets,
    pendingSync,
    isLoading,
    isCreating,
    createTicket,
    clearMyTicket,
    loadFromStorage,
  } = useQueueStore()

  const { isOnline } = useNetworkStore()

  const ticketsAhead = myTicket
    ? allTickets.filter(
        t =>
          t.serviceType === myTicket.serviceType &&
          t.status !== 'completed' &&
          t.position < myTicket.position
      )
    : []

  const serviceQueue = myTicket
    ? allTickets
        .filter(t => t.serviceType === myTicket.serviceType && t.status !== 'completed')
        .sort((a, b) => a.position - b.position)
    : []

  const pendingSyncCount = pendingSync.length

  const handleCreateTicket = async (serviceType: ServiceType, patientName: string) => {
    if (isCreating) return null
    return createTicket(serviceType, patientName)
  }

  return {
    myTicket,
    allTickets,
    serviceQueue,
    ticketsAhead,
    isLoading,
    isCreating,
    isOnline,
    pendingSyncCount,
    createTicket: handleCreateTicket,
    clearMyTicket,
    loadFromStorage,
  }
}