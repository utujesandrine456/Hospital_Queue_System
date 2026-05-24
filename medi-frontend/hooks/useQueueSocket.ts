'use client'

import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { WS_URL } from '@/lib/api/config'
import { useQueueStore } from '@/store/queueStore'

let socket: Socket | null = null

export function useQueueSocket() {
  const syncFromApi = useQueueStore(s => s.syncFromApi)

  useEffect(() => {
    socket = io(WS_URL, { transports: ['websocket', 'polling'] })

    const onQueueUpdate = () => {
      void syncFromApi()
    }

    socket.onAny((event: string) => {
      if (event.startsWith('queue:')) onQueueUpdate()
    })

    return () => {
      socket?.offAny()
      socket?.disconnect()
      socket = null
    }
  }, [syncFromApi])
}
