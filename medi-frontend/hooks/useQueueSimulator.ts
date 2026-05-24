'use client'

import { useEffect } from 'react'
import { useQueueStore } from '@/store/queueStore'
import type { ServiceType } from '@/types'

export function useQueueSimulator(serviceType: ServiceType | null) {
  const { syncFromApi, myTicket } = useQueueStore()

  useEffect(() => {
    if (!serviceType) return
    if (myTicket?.status === 'completed') return

    const poll = async () => {
      if (document.hidden) return
      await syncFromApi()
    }

    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [serviceType, myTicket?.status, syncFromApi])
}
