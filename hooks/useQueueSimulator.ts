'use client'

import { useEffect, useRef } from 'react'
import { useQueueStore } from '@/store/queueStore'
import { getAllTickets } from '@/lib/db/idb'
import type { ServiceType } from '@/types'

export function useQueueSimulator(serviceType: ServiceType | null) {
  const { advanceQueue, myTicket, loadFromStorage } = useQueueStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!serviceType) return
    if (myTicket?.status === 'completed') return

    const advance = async () => {
      if (document.hidden) return

      const tickets = await getAllTickets()
      const serviceTickets = tickets.filter(
        t => t.serviceType === serviceType && t.status !== 'completed'
      )

      if (serviceTickets.length === 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }

      await advanceQueue()
      await loadFromStorage()
    }

    intervalRef.current = setInterval(advance, 12000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [serviceType, myTicket?.status, advanceQueue, loadFromStorage])
}