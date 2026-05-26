'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueueStore } from '@/store/queueStore'
import { useServiceStore } from '@/store/serviceStore'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useQueueSimulator } from '@/hooks/useQueueSimulator'
import { useQueueSocket } from '@/hooks/useQueueSocket'
import { resolveTicketById, resolveTicketFromStore } from '@/lib/api/loadTicket'
import { fetchDepartmentQueue, mergeServiceQueue } from '@/lib/api/sync'
import { TicketCard } from '@/components/queue/TicketCard'
import { QueueStatus } from '@/components/queue/QueueStatus'
import { WaitingList } from '@/components/queue/WaitingList'
import { ArrowLeft } from 'lucide-react'
import type { QueueTicket } from '@/types'
import Image from 'next/image'
import { FullScreenLoader } from '@/components/ui/Loader'
import { useLanguage } from '@/context/LanguageContext'
import { toast } from 'sonner'

interface PublicTicketViewProps {
  ticketId: string
  onBack?: () => void
}

export function PublicTicketView({ ticketId, onBack }: PublicTicketViewProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const allTickets = useQueueStore(s => s.allTickets)
  const myTicket = useQueueStore(s => s.myTicket)
  const syncFromApi = useQueueStore(s => s.syncFromApi)
  const apiError = useQueueStore(s => s.apiError)
  const [ticket, setTicket] = useState<QueueTicket | null>(() =>
    resolveTicketFromStore(ticketId),
  )
  const [departmentQueue, setDepartmentQueue] = useState<QueueTicket[]>([])
  const [isLoading, setIsLoading] = useState(() => !resolveTicketFromStore(ticketId))
  const prevPosition = useRef<number | null>(null)
  const prevStatus = useRef<string | null>(null)

  useNetworkStatus()
  useQueueSocket()
  useQueueSimulator(ticket?.serviceType ?? null)

  const refreshQueue = useCallback(async (current: QueueTicket) => {
    try {
      await useServiceStore.getState().loadServices()
      const departmentId = useServiceStore
        .getState()
        .getDepartmentId(current.serviceType)

      if (departmentId) {
        const queue = await fetchDepartmentQueue(departmentId)
        setDepartmentQueue(queue)
        return
      }
    } catch (err) {
      console.warn('[PublicTicketView] Department queue fetch failed:', err)
    }

    const { allTickets: storeTickets } = useQueueStore.getState()
    setDepartmentQueue(mergeServiceQueue(storeTickets, current))
  }, [])

  useEffect(() => {
    const unsub = useQueueStore.persist.onFinishHydration(() => {
      const hydrated = resolveTicketFromStore(ticketId)
      if (!hydrated) return
      setTicket(hydrated)
      prevPosition.current = hydrated.position
      prevStatus.current = hydrated.status
      setIsLoading(false)
      void refreshQueue(hydrated)
    })
    return unsub
  }, [ticketId, refreshQueue])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const cached = resolveTicketFromStore(ticketId)
      if (cached) {
        setTicket(cached)
        prevPosition.current = cached.position
        prevStatus.current = cached.status
        setIsLoading(false)
        void refreshQueue(cached)
      } else {
        setIsLoading(true)
      }

      const resolved = await resolveTicketById(ticketId)
      if (cancelled) return

      if (resolved) {
        setTicket(resolved)
        prevPosition.current = resolved.position
        prevStatus.current = resolved.status
        void refreshQueue(resolved)
      }

      if (!cancelled) setIsLoading(false)

      void syncFromApi().then(() => {
        if (cancelled) return
        const refreshed = resolveTicketFromStore(ticketId)
        if (refreshed) {
          setTicket(refreshed)
          void refreshQueue(refreshed)
        }
      })
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [ticketId, syncFromApi, refreshQueue])

  useEffect(() => {
    const updated =
      allTickets.find(t => t.id === ticketId) ||
      (myTicket?.id === ticketId ? myTicket : null)

    if (!updated) return

    const positionChanged =
      prevPosition.current !== null &&
      updated.position < prevPosition.current &&
      updated.position > 0
    const statusChanged =
      prevStatus.current !== null && updated.status !== prevStatus.current

    if (positionChanged || statusChanged) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }

      if (
        updated.status === 'serving' &&
        (statusChanged || updated.position === 1)
      ) {
        toast.success(t('nowServing') || 'It is your turn! Please proceed.', {
          position: 'top-center',
          duration: 10000,
        })
      } else if (positionChanged) {
        toast.info(
          t('positionUpdated') || `Position updated: #${updated.position}`,
          { position: 'top-center' },
        )
      }
    }

    prevPosition.current = updated.position
    prevStatus.current = updated.status
    setTicket(updated)
    void refreshQueue(updated)
  }, [allTickets, myTicket, ticketId, t, refreshQueue])

  useEffect(() => {
    if (!ticket || ticket.status === 'completed' || ticket.status === 'cancelled') return

    const poll = async () => {
      if (document.hidden) return
      await syncFromApi()
      const resolved = await resolveTicketById(ticketId)
      if (!resolved) return

      const statusChanged =
        prevStatus.current !== null && resolved.status !== prevStatus.current

      if (statusChanged && resolved.status === 'completed') {
        toast.success(t('serviceComplete') ?? 'Your service is complete. Thank you!', {
          position: 'top-center',
        })
      }

      prevStatus.current = resolved.status
      prevPosition.current = resolved.position
      setTicket(resolved)
      await refreshQueue(resolved)
    }

    void poll()
    const interval = setInterval(() => void poll(), 3000)
    return () => clearInterval(interval)
  }, [ticketId, ticket?.status, syncFromApi, refreshQueue, t])

  const serviceQueue = useMemo(() => {
    if (!ticket) return []
    if (departmentQueue.length > 0) {
      return mergeServiceQueue(departmentQueue, ticket)
    }
    return mergeServiceQueue(allTickets, ticket)
  }, [ticket, departmentQueue, allTickets])

  if (isLoading && !ticket) {
    return <FullScreenLoader text={t('validatingTicket')} />
  }

  if (!ticket) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-2xl font-bold">{t('ticketNotFound')}</h2>
          {apiError && (
            <p className="text-sm text-red-600 font-medium">{apiError}</p>
          )}
          <button
            type="button"
            onClick={() => (onBack ? onBack() : router.push('/'))}
            className="text-sage font-bold"
          >
            {t('backToHome')}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-[#F3EFE3] flex flex-col lg:flex-row overflow-hidden">
      <div className="relative w-full lg:w-1/2 lg:h-screen border-r border-sage/10 z-10 flex flex-col backdrop-blur-md bg-white/20">
        <div className="max-w-xl mx-auto w-full px-6 py-10 flex-1 flex flex-col justify-center">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : router.push('/'))}
            className="cursor-pointer flex items-center gap-2 text-sage/50 hover:text-sage text-sm font-bold mb-10 transition-colors"
          >
            <ArrowLeft size={16} />
            {t('backToServices')}
          </button>
          <TicketCard ticket={ticket} />
        </div>
      </div>

      <div className="flex-1 h-full lg:overflow-y-auto z-10 p-6 lg:p-12">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-10">
            <QueueStatus ticket={ticket} queue={serviceQueue} />
            {serviceQueue.length > 0 ? (
              <WaitingList tickets={serviceQueue} currentUserTicketId={ticket.id} />
            ) : ticket.status === 'completed' ? null : (
              <p className="text-center text-sm text-sage/50 font-medium">
                {t('queueRefreshing') ?? 'Refreshing live queue…'}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
