'use client'

import { getStatusText, cn } from '@/lib/utils'
import type { QueueTicket } from '@/types'
import { motion } from 'framer-motion'
import { CheckCircle2, Activity, Zap, Timer, Sparkles } from 'lucide-react'

interface QueueStatusProps {
  ticket: QueueTicket
  totalInQueue: number
}

export function QueueStatus({ ticket, totalInQueue }: QueueStatusProps) {
  const isServing = ticket.status === 'serving'
  const isCompleted = ticket.status === 'completed'
  const isNext = ticket.status === 'waiting' && ticket.position <= 2

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl p-5 border transition-all duration-500',
          isCompleted
            ? 'border-sage/10 bg-transparent'
            : isServing
              ? 'border-sage/20 bg-white shadow-xl shadow-sage/5'
              : isNext
                ? 'border-sage/20 bg-white/60 shadow-lg shadow-sage/5'
                : 'border-sage/10 bg-white/20'
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500',
            isServing ? 'bg-sage text-cream shadow-md' : 'bg-sage/10 text-sage'
          )}>
            {isCompleted ? <CheckCircle2 size={20} /> : isServing ? <Activity size={20} /> : isNext ? <Zap size={20} /> : <Timer size={20} />}
          </div>

          <div className="text-left">
            <p className="text-[12px] font-bold text-sage/60">Status Update</p>
            <p className={cn(
              'text-base font-bold',
              isServing ? 'text-sage' : 'text-[#2C3639]'
            )}>
              {getStatusText(ticket.status, ticket.position)}
            </p>
          </div>
        </div>
      </motion.div>

      {!isCompleted && totalInQueue > 0 && (
        <div className="space-y-4 px-4 pt-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-sage/40">Queue progress</p>
              <p className="text-sm font-bold text-sage">{ticket.position} people ahead of you</p>
            </div>
            <p className="text-[10px] font-bold text-sage/30">{Math.round(((totalInQueue - ticket.position + 1) / totalInQueue) * 100)}% Complete</p>
          </div>
          <div className="h-4 bg-sage/5 rounded-full overflow-hidden p-1 shadow-inner border border-sage/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(5, ((totalInQueue - ticket.position + 1) / totalInQueue) * 100)}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-sage rounded-full shadow-lg shadow-sage/20 relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
              />
            </motion.div>
          </div>
        </div>
      )}

      {isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 px-4"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-sage/5 border border-sage/10 text-sage/60 font-bold text-xs italic">
            <Sparkles size={14} />
            Thank you for visiting. Get well soon!
            <Sparkles size={14} />
          </div>
        </motion.div>
      )}
    </div>
  )
}