'use client'

import type { QueueTicket } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, ChevronRight, Activity, CalendarCheck2 } from 'lucide-react'
import { SERVICE_CONFIG } from '@/lib/queue/engine'
import { cn } from '@/lib/utils'

interface WaitingListProps {
  tickets: QueueTicket[]
}

export function WaitingList({ tickets }: WaitingListProps) {
  const waitingTickets = tickets.filter((t) => t.status === 'waiting')
  const servingTickets = tickets.filter((t) => t.status === 'serving')

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#2C3639]">Waiting Lounge</h3>
          <p className="text-sm font-medium text-sage/50 mt-0.5">Real-time priority list</p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-md bg-white border border-sage/10 shadow-sm text-sage">
          <Users size={16} strokeWidth={2.5} />
          <span className="font-bold text-sm">{tickets.length} in queue</span>
        </div>
      </div>

      {/* Now serving */}
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
              <motion.div
                key={ticket.id}
                layout
                className="relative overflow-hidden flex items-center gap-5 p-5 rounded-lg bg-sage shadow-xl shadow-sage/20"
              >
                {/* shimmer */}
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
                </div>
                <ChevronRight size={20} className="text-white/50 shrink-0" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting list */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-sage/15 scrollbar-track-transparent pr-1">
        {waitingTickets.length > 0 ? (
          <>
            <p className="text-[10px] font-bold text-[#2C3639]/40 px-1">Up Next</p>
            <AnimatePresence mode="popLayout">
              {waitingTickets.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: i * 0.04 }}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-sage/8 hover:border-sage/25 hover:shadow-lg hover:shadow-sage/8 transition-all duration-300 cursor-pointer"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-center font-bold text-xs shrink-0 transition-all duration-300",
                    i === 0
                      ? "bg-amber-50 text-amber-600 border border-amber-200 group-hover:bg-amber-100"
                      : "bg-[#F3EFE3] text-sage group-hover:bg-sage group-hover:text-white"
                  )}>
                    {ticket.ticketNumber}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#2C3639] text-sm truncate">
                      {ticket.patientName !== 'Anonymous' ? ticket.patientName : SERVICE_CONFIG[ticket.serviceType]?.label}
                    </p>
                    <p className="text-[10px] font-bold text-sage/50">
                      {SERVICE_CONFIG[ticket.serviceType]?.label} · Pos #{ticket.position}
                    </p>
                  </div>

                  {/* Wait time chip */}
                  <div className="flex items-center gap-1.5 text-sage text-xs font-bold bg-sage/8 px-3 py-1.5 rounded-xl border border-sage/10 shrink-0">
                    <Clock size={12} />
                    {ticket.estimatedWaitMinutes}m
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        ) : (
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
              <p className="text-sm text-sage/50 font-bold mt-1">No patients currently waiting.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}