'use client'

import type { QueueTicket } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, ArrowRight, Activity, Smile } from 'lucide-react'
import { SERVICE_CONFIG } from '@/lib/queue/engine'

interface WaitingListProps {
  tickets: QueueTicket[]
}

export function WaitingList({ tickets }: WaitingListProps) {
  const waitingTickets = tickets.filter((t) => t.status === 'waiting')
  const servingTickets = tickets.filter((t) => t.status === 'serving')

  return (
    <div className="h-full flex flex-col pt-4">
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-[#2C3639]">Waiting Lounge</h3>
          <p className="text-sm font-bold text-sage/40 italic">Real-time priority list</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-sage/5 border border-sage/10 text-sage shadow-sm">
          <Users size={18} />
          <span className="text-lg font-bold">{tickets.length}</span>
        </div>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-sage/10 hover:scrollbar-thumb-sage/20 scrollbar-track-transparent">
        {/* Serving Section */}
        {servingTickets.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-sage italic flex items-center gap-2 px-2">
              <Activity size={10} className="animate-pulse" />
              Now Serving
            </p>
            <AnimatePresence mode="popLayout">
              {servingTickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-5 rounded-2xl bg-sage text-cream shadow-xl shadow-sage/20 border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xl">
                      #{ticket.ticketNumber}
                    </div>
                    <div>
                      <p className="text-base font-bold">Room 0{Math.floor(Math.random() * 5) + 1}</p>
                      <p className="text-[10px] text-cream/60 font-bold italic">{SERVICE_CONFIG[ticket.serviceType]?.label}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Waiting List Section */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-[#2C3639]/40 italic px-2">Up Next</p>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {waitingTickets.length > 0 ? (
                waitingTickets.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl bg-white border border-sage/5 hover:border-sage/20 hover:shadow-xl hover:shadow-sage/5 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-sage/5 text-sage flex items-center justify-center font-bold text-lg group-hover:bg-sage group-hover:text-cream transition-colors">
                        {ticket.ticketNumber}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#2C3639]">{SERVICE_CONFIG[ticket.serviceType]?.label}</p>
                        <p className="text-[10px] text-sage/40 font-bold italic">Position: {ticket.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sage/30 text-[10px] font-bold italic">
                      <Clock size={12} />
                      {ticket.estimatedWaitMinutes}m
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-sage/5 flex items-center justify-center text-sage/40">
                    <Smile size={32} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#2C3639]/60">All patients served.</p>
                    <p className="text-[10px] text-sage/30 font-bold italic">Great job team!</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}