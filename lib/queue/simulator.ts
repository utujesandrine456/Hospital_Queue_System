import { advanceQueueInDB } from './engine'
import type { ServiceType } from '@/types'

type AdvanceCallback = (serviceType: ServiceType) => void

class QueueSimulator {
  private intervals: Map<ServiceType, ReturnType<typeof setInterval>> = new Map()
  private callbacks: Set<AdvanceCallback> = new Set()

  start(serviceType: ServiceType, intervalMs: number = 12000) {
    if (this.intervals.has(serviceType)) return

    const interval = setInterval(async () => {
      if (document.hidden) return

      try {
        await advanceQueueInDB(serviceType)
        this.callbacks.forEach(cb => cb(serviceType))
      } catch (err) {
        console.error('[Simulator] Error advancing queue:', err)
      }
    }, intervalMs)

    this.intervals.set(serviceType, interval)
  }

  stop(serviceType: ServiceType) {
    const interval = this.intervals.get(serviceType)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(serviceType)
    }
  }

  stopAll() {
    this.intervals.forEach((_, serviceType) => this.stop(serviceType))
  }

  onAdvance(callback: AdvanceCallback) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }
}

export const queueSimulator = new QueueSimulator()