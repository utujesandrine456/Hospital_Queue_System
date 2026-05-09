'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQueueStore } from '@/store/queueStore'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useQueueSimulator } from '@/hooks/useQueueSimulator'
import { getTicket } from '@/lib/db/idb'
import { TicketCard } from '@/components/queue/TicketCard'
import { QueueStatus } from '@/components/queue/QueueStatus'
import { WaitingList } from '@/components/queue/WaitingList'
import { Activity, Ticket, ArrowLeft } from 'lucide-react'
import type { QueueTicket } from '@/types'
import Image from 'next/image'
import { FullScreenLoader } from '@/components/ui/Loader'
import { useLanguage } from '@/context/LanguageContext'
import { toast } from 'sonner'
import { useRef } from 'react'

export default function QueuePage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.ticketId as string
  const { t } = useLanguage()

  const { allTickets, myTicket, loadFromStorage } = useQueueStore()
  const [ticket, setTicket] = useState<QueueTicket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const prevPosition = useRef<number | null>(null)

  useNetworkStatus()
  useQueueSimulator(ticket?.serviceType ?? null)

  useEffect(() => {
    const loadTicket = async () => {
      setIsLoading(true)
      try {
        await loadFromStorage()

        const fromStore = allTickets.find(t => t.id === ticketId) ?? myTicket

        if (fromStore?.id === ticketId) {
          setTicket(fromStore)
          prevPosition.current = fromStore.position
        } else {
          const fromDB = await getTicket(ticketId)
          if (fromDB) {
            setTicket(fromDB)
            prevPosition.current = fromDB.position
          }
        }
      } catch (err) {
        console.error('[QueuePage] Failed to load ticket:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTicket()
  }, [ticketId])

  useEffect(() => {
    const updated = allTickets.find(t => t.id === ticketId)
    const freshTicket = updated || (myTicket?.id === ticketId ? myTicket : null)

    if (freshTicket) {
      if (
        prevPosition.current !== null &&
        freshTicket.position < prevPosition.current &&
        freshTicket.position > 0
      ) {
        if (freshTicket.position === 1) {
          toast.success(t('nowServing') || "It is your turn! Please proceed.", { position: 'top-center', duration: 8000 })
        } else {
          toast.info(t('positionUpdated') || `You moved up! You are now number ${freshTicket.position} in queue.`, { position: 'top-center' })
        }
      }
      prevPosition.current = freshTicket.position
      setTicket(freshTicket)
    }
  }, [allTickets, myTicket, ticketId, t])

  const fullQueue = ticket
    ? allTickets.filter(
      t => t.serviceType === ticket.serviceType && t.status !== 'completed'
    )
    : []

  if (isLoading) {
    return <FullScreenLoader text={t('validatingTicket')} />
  }

  if (!ticket) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-sage/5 flex items-center justify-center text-sage/20 mx-auto">
            <Ticket size={48} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#2C3639]">{t('ticketNotFound')}</h2>
            <p className="text-sage/60 font-medium">
              {t('ticketExpired')}
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 text-sage rounded-lg hover:text-sage/80 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Ticket size={18} />
            {t('getAnotherTicket')}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="relative h-screen bg-[#F3EFE3] flex flex-col lg:flex-row overflow-hidden selection:bg-sage/20">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-[#F3EFE3] via-[#EAF2ED] to-[#F3EFE3]" />

        {/* Animated Glow Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sage/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-sage/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
      </div>

      <div className="relative w-full lg:w-1/2 xl:w-1/2 lg:h-full border-r border-sage/10 z-10 flex flex-col backdrop-blur-md bg-white/20">
        <div className="max-w-xl mx-auto w-full px-6 lg:px-8 py-8 lg:py-10 flex-1 flex flex-col justify-center">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sage/50 hover:text-sage text-sm font-bold mb-10 transition-colors group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t('backToServices')}
          </button>

          <div className="space-y-8">
            <TicketCard ticket={ticket} />
          </div>

          {ticket.status === 'completed' && (
            <div className="mt-8">
              <button
                onClick={() => router.push('/')}
                className="w-full py-5 bg-sage hover:bg-sage/90 text-cream rounded-2xl font-bold text-xl transition-all shadow-xl shadow-sage/20 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Ticket size={24} strokeWidth={2.5} />
                {t('getNewTicket')}
              </button>
            </div>
          )}

          {ticket.status !== 'completed' && (
            <div className="text-center mt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/5 border border-sage/10">
                <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
                <span className="text-[9px] font-bold text-sage">
                  {t('autoSyncing')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 h-full lg:overflow-y-auto z-10">
        <div className="max-w-2xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
          {fullQueue.length > 0 ? (
            <div className="space-y-10">
              <QueueStatus ticket={ticket} totalInQueue={fullQueue.length} />

              <div>
                <h2 className="text-4xl font-bold text-[#2C3639]">{t('liveWaitingList')}</h2>
                <p className="text-sage/60 font-medium mt-2">{t('realTimeStatus')}</p>
              </div>
              <WaitingList tickets={fullQueue} currentUserTicketId={ticket.id} />
            </div>
          ) : (
            <div className="h-auto flex flex-col items-center justify-center text-center py-6">
              <div className="mb-10 w-64 h-64 lg:w-80 lg:h-80 relative opacity-90 transition-transform hover:scale-105 duration-500">
                <Image
                  src="/images/queue-empty.png"
                  alt="Doctor is ready"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h3 className="text-3xl lg:text-4xl font-black text-[#2C3639]">
                {ticket.position === 1 ? "You're at the Front!" : "Quiet Day"}
              </h3>
              <p className="text-sage/60 max-w-sm mt-4 text-sm font-medium leading-relaxed">
                {ticket.position === 1
                  ? "You are currently the only patient in this department. A specialist is preparing to see you shortly—please keep your app open."
                  : "There are currently no other patients waiting ahead or behind you in this department."}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}