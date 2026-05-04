'use client'

import { useEffect } from 'react'
import { useNetworkStore } from '@/store/networkStore'
import { processOutbox } from '@/lib/sync/outbox'

export function useNetworkStatus() {
  const { isOnline, setOnline } = useNetworkStore()

  useEffect(() => {
    setOnline(navigator.onLine)

    const handleOnline = async () => {
      setOnline(true)
      try {
        await processOutbox()
      } catch (err) {
        console.error('[Network] Outbox processing failed:', err)
      }
    }

    const handleOffline = () => {
      setOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  return { isOnline }
}