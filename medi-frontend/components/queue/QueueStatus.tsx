'use client'

import { getStatusText, cn } from '@/lib/utils'
import type { QueueTicket } from '@/types'
import { motion } from 'framer-motion'
import { CheckCircle2, Activity, Zap, Timer, Sparkles } from 'lucide-react'
import { SERVICE_CONFIG } from '@/lib/queue/engine'
import { useServiceTimer } from '@/hooks/useServiceTimer'

interface QueueStatusProps {
  ticket: QueueTicket
  queue: QueueTicket[]
}

export function QueueStatus({ ticket, queue }: QueueStatusProps) {
  const isServing = ticket.status === 'serving'
  const isCompleted = ticket.status === 'completed' || ticket.status === 'done'
  const isWaiting = ticket.status === 'waiting'

  const avgMin = ticket.avgServiceMinutes ?? SERVICE_CONFIG[ticket.serviceType]?.avgServiceMinutes ?? 5
  const { percent: servicePercent, remainingMinutes } = useServiceTimer(
    isServing ? ticket.servingStartedAt : null,
    avgMin,
  )

  const peopleAhead = queue.filter(
    t => t.status === 'waiting' && t.id !== ticket.id && t.position < ticket.position,
  ).length

  const waitingTotal = queue.filter(t => t.status === 'waiting').length

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
              : peopleAhead === 0
                ? 'border-sage/20 bg-white/60 shadow-lg shadow-sage/5'
                : 'border-sage/10 bg-white/20',
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500',
              isServing ? 'bg-sage text-cream shadow-md' : 'bg-sage/10 text-sage',
            )}
          >
            {isCompleted ? (
              <CheckCircle2 size={20} />
            ) : isServing ? (
              <Activity size={20} />
            ) : peopleAhead === 0 ? (
              <Zap size={20} />
            ) : (
              <Timer size={20} />
            )}
          </div>

          <div className="text-left">
            <p className="text-[12px] font-bold text-sage/60">Status Update</p>
            <p className={cn('text-base font-bold', isServing ? 'text-sage' : 'text-[#2C3639]')}>
              {getStatusText(ticket.status, ticket.position)}
            </p>
          </div>
        </div>
      </motion.div>

      {isServing && (
        <div className="space-y-4 px-4 pt-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-sage/40">Service time</p>
              <p className="text-sm font-bold text-sage">
                {avgMin} min slot · ~{remainingMinutes} min remaining
              </p>
            </div>
            <p className="text-[10px] font-bold text-sage/30">{Math.round(servicePercent)}%</p>
          </div>
          <div className="h-4 bg-sage/5 rounded-full overflow-hidden p-1 shadow-inner border border-sage/5">
            <motion.div
              className="h-full bg-sage rounded-full shadow-lg shadow-sage/20"
              style={{ width: `${Math.max(2, servicePercent)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {isWaiting && waitingTotal > 0 && (
        <div className="space-y-4 px-4 pt-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-sage/40">Queue progress</p>
              <p className="text-sm font-bold text-sage">
                {peopleAhead === 0
                  ? 'You are next in line'
                  : `${peopleAhead} ${peopleAhead === 1 ? 'person' : 'people'} ahead of you`}
              </p>
            </div>
            <p className="text-[10px] font-bold text-sage/30">
              {peopleAhead === 0 ? 'Up next' : `#${ticket.position}`}
            </p>
          </div>
          <div className="h-4 bg-sage/5 rounded-full overflow-hidden p-1 shadow-inner border border-sage/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.max(
                  8,
                  ((waitingTotal - peopleAhead) / Math.max(1, waitingTotal)) * 100,
                )}%`,
              }}
              transition={{ duration: 1, ease: 'circOut' }}
              className="h-full bg-sage rounded-full shadow-lg shadow-sage/20"
            />
          </div>
        </div>
      )}

      {isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-2 px-4"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-sage border border-sage/10 text-white font-bold text-xs italic">
            <Sparkles size={14} />
            Service complete. Thank you for visiting!
            <Sparkles size={14} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
