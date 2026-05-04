'use client'

import { useNetworkStore } from '@/store/networkStore'
import { useQueueStore } from '@/store/queueStore'
import { cn } from '@/lib/utils'

export function OfflineBanner() {
  const { isOnline } = useNetworkStore()
  const { pendingSync } = useQueueStore()

  if (isOnline && pendingSync.length === 0) return null

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-4 py-2.5 text-center text-sm font-medium',
        'flex items-center justify-center gap-2',
        'transition-all duration-300',
        !isOnline
          ? 'bg-sage/10 text-sage backdrop-blur-md border-b border-sage/10'
          : 'bg-sage text-cream shadow-lg'
      )}
    >
      {!isOnline ? (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-amber-900/60 animate-pulse" />
          <span>
            You&apos;re offline — your ticket is saved locally and will sync when connected
          </span>
        </>
      ) : (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          <span>Syncing {pendingSync.length} pending action{pendingSync.length !== 1 ? 's' : ''}...</span>
        </>
      )}
    </div>
  )
}