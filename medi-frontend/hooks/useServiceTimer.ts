'use client'

import { useEffect, useState } from 'react'

/** Live countdown for an active service slot (ticks every second). */
export function useServiceTimer(
  servingStartedAt: number | null,
  avgServiceMinutes: number,
) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!servingStartedAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [servingStartedAt])

  const serviceMs = Math.max(1, avgServiceMinutes) * 60 * 1000
  const elapsed = servingStartedAt ? now - servingStartedAt : 0
  const remainingMs = Math.max(0, serviceMs - elapsed)
  const percent = servingStartedAt ? Math.min(100, (elapsed / serviceMs) * 100) : 0
  const expired = Boolean(servingStartedAt && elapsed >= serviceMs)

  return {
    elapsedMs: elapsed,
    remainingMs,
    percent,
    expired,
    remainingMinutes: Math.ceil(remainingMs / 60_000),
    totalMinutes: avgServiceMinutes,
  }
}
