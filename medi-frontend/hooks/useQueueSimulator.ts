'use client'

import { useEffect } from 'react'
import { useQueueStore } from '@/store/queueStore'
import type { ServiceType } from '@/types'

export function useQueueSimulator(serviceType: ServiceType | null) {
  const { loadFromStorage, myTicket } = useQueueStore()

  useEffect(() => {
    if (!serviceType) return
    if (myTicket?.status === 'completed') return

    const pollIdbSync = async () => {
      if (document.hidden) return
      await loadFromStorage()
    }

    const interval = setInterval(pollIdbSync, 5000)

    return () => clearInterval(interval)
  }, [serviceType, myTicket?.status, loadFromStorage])
}