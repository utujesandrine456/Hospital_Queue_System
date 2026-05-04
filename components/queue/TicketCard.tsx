'use client'

import type { QueueTicket } from '@/types'
import { motion } from 'framer-motion'
import { HeartPulse, Clock, Calendar, Activity, Zap, Pill, Stethoscope, FlaskConical, Microscope } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SERVICE_CONFIG } from '@/lib/queue/engine'

const ICON_MAP = {
  consultation: Stethoscope,
  laboratory: FlaskConical,
  pharmacy: Pill,
  radiology: Microscope,
}

interface TicketCardProps {
  ticket: QueueTicket
}

export function TicketCard({ ticket }: TicketCardProps) {
  const isServing = ticket.status === 'serving'
  // const isCompleted = ticket.status === 'completed'
  // const isWaiting = ticket.status === 'waiting'

  const serviceConfig = SERVICE_CONFIG[ticket.serviceType]
  const Icon = ICON_MAP[ticket.serviceType as keyof typeof ICON_MAP] || Activity

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* Premium Outer Container */}
      <div className="bg-white rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(118,147,130,0.15)] border border-sage/5 overflow-hidden relative group">

        {/* Glow Effect */}
        <div className={cn(
          "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] transition-all duration-1000",
          isServing ? "bg-sage/20" : "bg-sage/5"
        )} />

        <div className="relative z-10 space-y-10">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center text-sage">
                  <HeartPulse size={18} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-[#2C3639]">BlinkCare</h3>
              </div>
              <p className="text-[10px] font-bold text-sage/40 px-11 italic">Smart Health Systems</p>
            </div>
            <div className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-bold border flex items-center gap-2",
              isServing ? "bg-sage/10 border-sage/20 text-sage" : "bg-sage/5 border-sage/10 text-sage/40"
            )}>
              {isServing && <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />}
              {ticket.status}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-12 py-4">
            <div className="text-center space-y-4">
              <p className="text-[12px] font-bold text-sage/30 italic">Priority Patient Ticket</p>
              <div className="relative inline-block">
                <h2 className="text-9xl font-bold text-[#2C3639]">
                  #{ticket.ticketNumber}
                </h2>
                {isServing && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-sage rounded-full flex items-center justify-center text-cream shadow-lg"
                  >
                    <Activity size={20} />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 border-y border-sage/5 py-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sage/40">
                  <Clock size={16} />
                  <span className="text-[10px] font-bold italic">Generated</span>
                </div>
                <p className="text-lg font-bold text-[#2C3639]">
                  {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="space-y-4 text-right">
                <div className="flex items-center gap-3 text-sage/40 justify-end">
                  <Zap size={16} />
                  <span className="text-[10px] font-bold italic">Wait Est.</span>
                </div>
                <p className="text-lg font-bold text-sage">
                  {ticket.estimatedWaitMinutes} min
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-sage/5 border border-sage/10">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sage shadow-sm border border-sage/5">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-sage/40 italic">Clinical Dept.</p>
                <p className="text-sm font-bold text-[#2C3639]">{serviceConfig?.label || 'General'}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold text-sage/20 px-2 italic">
              <div className="flex items-center gap-2">
                <Calendar size={12} />
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Pos: {ticket.position}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Ticket Cuts */}
        <div className="absolute top-1/2 left-0 w-8 h-8 bg-[#F3EFE3] rounded-full -translate-x-1/2 -translate-y-1/2 border border-sage/5" />
        <div className="absolute top-1/2 right-0 w-8 h-8 bg-[#F3EFE3] rounded-full translate-x-1/2 -translate-y-1/2 border border-sage/5" />
      </div>
    </motion.div>
  )
}