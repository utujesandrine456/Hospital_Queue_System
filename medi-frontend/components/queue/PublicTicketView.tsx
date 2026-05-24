'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueueStore } from '@/store/queueStore'
import { useServiceStore } from '@/store/serviceStore'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useQueueSimulator } from '@/hooks/useQueueSimulator'
import { useQueueSocket } from '@/hooks/useQueueSocket'
import { ticketsApi } from '@/lib/api/tickets'
import { mapTicketFromApi } from '@/lib/api/mappers'
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
  const { allTickets, myTicket, syncFromApi, apiError } = useQueueStore()
  const loadServices = useServiceStore(s => s.loadServices)
  const [ticket, setTicket] = useState<QueueTicket | null>(null)
  const [departmentQueue, setDepartmentQueue] = useState<QueueTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const prevPosition = useRef<number | null>(null)
  const prevStatus = useRef<string | null>(null)

  useNetworkStatus()
  useQueueSocket()
  useQueueSimulator(ticket?.serviceType ?? null)

  const refreshQueue = useCallback(async (current: QueueTicket) => {
    await useServiceStore.getState().loadServices()
    const departmentId = useServiceStore
      .getState()
      .getDepartmentId(current.serviceType)

    if (departmentId) {
      try {
        const queue = await fetchDepartmentQueue(departmentId)
        setDepartmentQueue(queue)
        return
      } catch (err) {
        console.warn('[PublicTicketView] Department queue fetch failed:', err)
      }
    }

    const { allTickets: storeTickets } = useQueueStore.getState()
    setDepartmentQueue(mergeServiceQueue(storeTickets, current))
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadTicket = async () => {
      setIsLoading(true)
      try {
        await loadServices()
        await syncFromApi()

        const state = useQueueStore.getState()
        let loaded =
          state.allTickets.find(t => t.id === ticketId) ||
          (state.myTicket?.id === ticketId ? state.myTicket : null)

        if (!loaded) {
          const numericId = Number(ticketId)
          if (!Number.isNaN(numericId)) {
            const apiTicket = await ticketsApi.getById(numericId)
            loaded = mapTicketFromApi(apiTicket)
          }
        }

        if (cancelled || !loaded) return

        setTicket(loaded)
        prevPosition.current = loaded.position
        prevStatus.current = loaded.status
        await refreshQueue(loaded)
      } catch (err) {
        console.error('[PublicTicketView] Load error:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadTicket()
    return () => {
      cancelled = true
    }
  }, [ticketId, syncFromApi, loadServices, refreshQueue])

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

  const serviceQueue = useMemo(() => {
    if (!ticket) return []
    if (departmentQueue.length > 0) {
      return mergeServiceQueue(departmentQueue, ticket)
    }
    return mergeServiceQueue(allTickets, ticket)
  }, [ticket, departmentQueue, allTickets])

  if (isLoading) return <FullScreenLoader text={t('validatingTicket')} />

  if (!ticket) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <h2 className="text-2xl font-bold">{t('ticketNotFound')}</h2>
          {apiError && (
            <p className="text-sm text-red-600 font-medium">{apiError}</p>
          )}
          <button
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
          {serviceQueue.length > 0 ? (
            <div className="space-y-10">
              <QueueStatus ticket={ticket} totalInQueue={serviceQueue.length} />
              <WaitingList tickets={serviceQueue} currentUserTicketId={ticket.id} />
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mb-10 w-48 h-48 mx-auto relative">
                <Image src="/images/queue-empty.png" alt="Empty" fill className="object-contain" />
              </div>
              <h3 className="text-2xl font-bold">{t('queueEmpty')}</h3>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
