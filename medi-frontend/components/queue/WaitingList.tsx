'use client'

import type { QueueTicket } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, ChevronRight, Activity, CalendarCheck2 } from 'lucide-react'
import { SERVICE_CONFIG } from '@/lib/queue/engine'
import { cn } from '@/lib/utils'
import { useServiceTimer } from '@/hooks/useServiceTimer'

interface WaitingListProps {
  tickets: QueueTicket[]
  currentUserTicketId?: string
}

function ServingCard({
  ticket,
  highlight,
}: {
  ticket: QueueTicket
  highlight: boolean
}) {
  const avgMin = ticket.avgServiceMinutes ?? SERVICE_CONFIG[ticket.serviceType]?.avgServiceMinutes ?? 5
  const { percent, remainingMinutes, expired } = useServiceTimer(
    ticket.servingStartedAt,
    avgMin,
  )

  return (
    <motion.div
      key={ticket.id}
      layout
      className={cn(
        'relative overflow-hidden flex items-center gap-5 p-5 rounded-lg bg-sage shadow-xl shadow-sage/20',
        highlight && 'ring-4 ring-amber-400 ring-offset-2',
      )}
    >
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
        className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none"
      />
      <div className="w-16 h-16 rounded-full p-2 bg-white/20 flex items-center justify-center font-bold text-sm text-white shrink-0 border border-white/20 shadow-inner">
        #{ticket.ticketNumber}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-base truncate">
          {ticket.patientName !== 'Anonymous' ? ticket.patientName : SERVICE_CONFIG[ticket.serviceType]?.label}
        </p>
        <p className="text-white/60 text-xs font-bold">{SERVICE_CONFIG[ticket.serviceType]?.label}</p>
        <p className="text-white/60 text-[10px] font-semibold mt-1">
          {expired
            ? `Service time exceeded — wrapping up...`
            : `~${remainingMinutes} min left of ${avgMin} min slot`}
        </p>
        <div className="mt-2 h-1 rounded-full bg-white/20 overflow-hidden">
          <div className={cn("h-full transition-all duration-1000", expired ? "bg-amber-400" : "bg-green-500")} style={{ width: `${percent}%` }} />
        </div>
      </div>
      <ChevronRight size={20} className="text-white/50 shrink-0" />
    </motion.div>
  )
}

export function WaitingList({ tickets, currentUserTicketId }: WaitingListProps) {
  const waitingTickets = tickets.filter(t => t.status === 'waiting')
  const servingTickets = tickets
    .filter(t => t.status === 'serving')
    .sort((a, b) => (a.servingStartedAt ?? a.createdAt) - (b.servingStartedAt ?? b.createdAt))
    .slice(0, 1)

  const hasAnyone = waitingTickets.length > 0 || servingTickets.length > 0

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#2C3639]">Waiting Lounge</h3>
          <p className="text-sm font-medium text-sage/50 mt-0.5">Live from hospital server</p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-md bg-white border border-sage/10 shadow-sm text-sage">
          <Users size={16} strokeWidth={2.5} />
          <span className="font-bold text-sm">
            {servingTickets.length > 0 && waitingTickets.length > 0
              ? `${servingTickets.length} serving · ${waitingTickets.length} waiting`
              : servingTickets.length > 0
                ? '1 In Queue'
                : waitingTickets.length > 0
                  ? `${waitingTickets.length} waiting`
                  : '0 active'}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {servingTickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-sage">
              <Activity size={13} className="animate-pulse" />
              Now Serving
            </div>
            {servingTickets.map(ticket => (
              <ServingCard
                key={ticket.id}
                ticket={ticket}
                highlight={ticket.id === currentUserTicketId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-sage/15 scrollbar-track-transparent pr-1">
        {waitingTickets.length > 0 ? (
          <>
            <p className="text-[10px] font-bold text-[#2C3639]/40 px-1">Up Next</p>
            <AnimatePresence mode="popLayout">
              {waitingTickets.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  layout
                  className={cn(
                    'group flex items-center gap-4 p-4 rounded-2xl bg-white border transition-all duration-300 cursor-pointer',
                    ticket.id === currentUserTicketId
                      ? 'border-amber-400 shadow-lg shadow-amber-100 ring-1 ring-amber-100'
                      : 'border-sage/8 hover:border-sage/25 hover:shadow-lg hover:shadow-sage/8',
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-center font-bold text-xs shrink-0 transition-all duration-300',
                      i === 0
                        ? 'bg-amber-50 text-amber-600 border border-amber-200 group-hover:bg-amber-100'
                        : 'bg-[#F3EFE3] text-sage group-hover:bg-sage group-hover:text-white',
                    )}
                  >
                    {ticket.ticketNumber}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2C3639] text-sm truncate">
                      {ticket.patientName !== 'Anonymous'
                        ? ticket.patientName
                        : SERVICE_CONFIG[ticket.serviceType]?.label}
                    </p>
                    <p className="text-[10px] font-bold text-sage/50">
                      {SERVICE_CONFIG[ticket.serviceType]?.label} · Pos #{ticket.position}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-sage text-xs font-bold bg-sage/8 px-3 py-1.5 rounded-xl border border-sage/10 shrink-0">
                    <Clock size={12} />
                    {ticket.estimatedWaitMinutes}m
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        ) : !hasAnyone ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center gap-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-sage/8 flex items-center justify-center text-sage/40">
              <CalendarCheck2 size={30} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-bold text-[#2C3639]">All caught up!</p>
              <p className="text-sm text-sage/50 font-bold mt-1">No patients in this department queue.</p>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}
