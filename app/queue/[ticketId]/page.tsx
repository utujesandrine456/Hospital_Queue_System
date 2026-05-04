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

export default function QueuePage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.ticketId as string

  const { allTickets, myTicket, loadFromStorage } = useQueueStore()
  const [ticket, setTicket] = useState<QueueTicket | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useNetworkStatus()
  useQueueSimulator(ticket?.serviceType ?? null)

  useEffect(() => {
    const loadTicket = async () => {
      setIsLoading(true)
      try {
        const fromStore = allTickets.find(t => t.id === ticketId) ?? myTicket

        if (fromStore?.id === ticketId) {
          setTicket(fromStore)
        } else {
          const fromDB = await getTicket(ticketId)
          if (fromDB) {
            setTicket(fromDB)
            await loadFromStorage()
          }
        }
      } catch (err) {
        console.error('[QueuePage] Failed to load ticket:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTicket()
  }, [ticketId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const updated = allTickets.find(t => t.id === ticketId)
    if (updated) setTicket(updated)
    else if (myTicket?.id === ticketId) setTicket(myTicket)
  }, [allTickets, myTicket, ticketId])

  const serviceQueue = ticket
    ? allTickets.filter(
      t => t.serviceType === ticket.serviceType && t.status !== 'completed'
    )
    : []

  if (isLoading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-sage/20 border-t-sage rounded-full animate-spin mx-auto" />
          <p className="text-sage/60 font-bold text-sm">Loading your ticket...</p>
        </div>
      </main>
    )
  }

  if (!ticket) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-sage/5 flex items-center justify-center text-sage/20 mx-auto">
            <Ticket size={48} strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#2C3639]">Ticket not found</h2>
            <p className="text-sage/60 font-medium">
              This ticket doesn&apos;t exist or may have expired.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 text-sage hover:text-sage/80 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Ticket size={18} />
            Get another ticket
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen bg-[#F3EFE3] flex flex-col lg:flex-row overflow-hidden selection:bg(var(--primary-sage)/20)">
      <div className="fixed inset-0 opacity-[0.15] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(var(--primary-sage) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative w-full lg:w-1/2 xl:w-1/2 lg:h-full border-r border-sage/10 z-10 flex flex-col">
        <div className="max-w-xl mx-auto w-full px-6 lg:px-8 py-8 lg:py-10 flex-1 flex flex-col justify-center">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sage/50 hover:text-sage text-sm font-bold mb-10 transition-colors group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to services
          </button>

          <div className="mb-6 text-center align-center items-center justify-center">
            <h1 className="text-3xl font-bold text-[#2C3639]">Your Queue Ticket</h1>
          </div>

          <div className="space-y-8">
            <TicketCard ticket={ticket} />
            <QueueStatus ticket={ticket} totalInQueue={serviceQueue.length} />
          </div>

          {ticket.status === 'completed' && (
            <div className="mt-8">
              <button
                onClick={() => router.push('/')}
                className="w-full py-5 bg-sage hover:bg-sage/90 text-cream rounded-2xl font-bold text-xl transition-all shadow-xl shadow-sage/20 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Ticket size={24} strokeWidth={2.5} />
                Get a New Ticket
              </button>
            </div>
          )}

          {ticket.status !== 'completed' && (
            <div className="text-center mt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/5 border border-sage/10">
                <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
                <span className="text-[9px] font-bold text-sage">
                  Auto-syncing
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Waiting List - Scrollable */}
      <div className="flex-1 h-full lg:overflow-y-auto z-10">
        <div className="max-w-2xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
          {serviceQueue.length > 0 ? (
            <div className="space-y-10">
              <div>
                <h2 className="text-4xl font-bold text-[#2C3639]">Live Waiting List</h2>
                <p className="text-sage/60 font-medium mt-2">Real-time status of all patients in this department</p>
              </div>
              <WaitingList tickets={serviceQueue} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 bg-sage/10 rounded-3xl flex items-center justify-center text-sage mb-6">
                <Activity size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3639]">Queue is Empty</h3>
              <p className="text-sage/50 max-w-xs mt-2">There are currently no other patients in the queue for this service.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}