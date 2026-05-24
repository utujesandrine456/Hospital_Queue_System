'use client'

import { useQueueStore } from '@/store/queueStore'
import { useServiceStore } from '@/store/serviceStore'
import { AlertCircle } from 'lucide-react'

export function ApiStatusBanner() {
  const apiError = useQueueStore(s => s.apiError)
  const loadError = useServiceStore(s => s.loadError)

  const message = apiError || loadError
  if (!message) return null

  return (
    <div
      role="alert"
      className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-start gap-3 text-amber-900"
    >
      <AlertCircle size={20} className="shrink-0 mt-0.5" />
      <div className="text-sm font-semibold">
        <p>{message}</p>
        <p className="font-normal text-amber-800/80 mt-1">
          Data is loaded from PostgreSQL via the API at{' '}
          {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:2000'} — not from browser storage.
        </p>
      </div>
    </div>
  )
}
