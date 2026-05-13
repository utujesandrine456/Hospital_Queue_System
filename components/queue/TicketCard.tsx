'use client'

import type { QueueTicket } from '@/types'
import { motion } from 'framer-motion'
import { Clock, Stethoscope, FlaskConical, Pill, Microscope, Activity, HeartPulse } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { SERVICE_CONFIG } from '@/lib/queue/engine'
import { useLanguage } from '@/context/LanguageContext'

const ICON_MAP = {
  consultation: Stethoscope,
  laboratory: FlaskConical,
  pharmacy: Pill,
  radiology: Microscope,
}

const STATUS_COLORS = {
  waiting: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400', border: 'border-amber-200' },
  serving: { bg: 'bg-sage/10', text: 'text-sage', dot: 'bg-sage', border: 'border-sage/30' },
  completed: { bg: 'bg-slate-50', text: 'text-slate-400', dot: 'bg-slate-300', border: 'border-slate-200' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-400', dot: 'bg-red-300', border: 'border-red-200' },
}

interface TicketCardProps {
  ticket: QueueTicket
}

export function TicketCard({ ticket }: TicketCardProps) {
  const { t } = useLanguage()
  const isServing = ticket.status === 'serving'
  const serviceConfig = SERVICE_CONFIG[ticket.serviceType]
  const Icon = ICON_MAP[ticket.serviceType as keyof typeof ICON_MAP] || Activity
  const statusStyle = STATUS_COLORS[ticket.status] || STATUS_COLORS.waiting
  const issuedTime = new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const issuedDate = new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'circOut' }}
      className="relative w-full max-w-sm mx-auto"
    >
      {/* Outer ticket shadow glow */}
      {isServing && (
        <div className="absolute inset-0 rounded-3xl bg-sage/20 blur-2xl scale-105 -z-10" />
      )}

      <div className={cn(
        "relative bg-white rounded-3xl overflow-hidden border shadow-2xl",
        isServing ? "border-sage/40 shadow-sage/15" : "border-sage/10 shadow-[#2C3639]/5"
      )}>

        <div className={cn(
          "relative px-7 pt-7 pb-6 overflow-hidden",
          isServing ? "bg-sage" : "bg-[#2C3639]"
        )}>
          {/* Abstract background circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

          {/* Header */}
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white shadow-lg border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                <Image src="/images/logo-image.png" alt="MediQueue" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-bold text-[15px] leading-tight tracking-wide">MediQueue</p>
                <p className="text-white/60 text-[12px] font-medium">{t('smartHealth')}</p>
              </div>
            </div>
            {/* Status badge */}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold bg-white/10",
              "text-white border-white/20"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isServing ? "bg-emerald-300 animate-pulse" : ticket.status === 'waiting' ? "bg-amber-300" : "bg-white/40"
              )} />
              <span>{isServing ? t('nowServing') : ticket.status === 'waiting' ? t('waiting') : t('completed')}</span>
            </div>
          </div>

          {/* Big ticket number */}
          <div className="relative text-center">
            <p className="text-white/40 text-[12px] font-semibold mb-1">{t('ticketNumber')}</p>
            <h2 className="text-7xl font-bold text-white leading-none">
              #{ticket.ticketNumber}
            </h2>
            {isServing && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mt-3 text-xs font-bold text-emerald-300"
              >
                {t('yourTurn')}
              </motion.div>
            )}
          </div>
        </div>

        {/* ===== PERFORATED DIVIDER / PROGRESS BAR ===== */}
        <div className="relative flex items-center">
          {/* Left notch */}
          <div className="absolute -left-4 w-8 h-8 rounded-full bg-[#F3EFE3] border border-sage/10 z-10" />

          {/* Progress Bar or Dashed Line */}
          {isServing && ticket.servingStartedAt ? (
            <div className="flex-1 mx-6 h-1.5 bg-sage/10 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, ((Date.now() - ticket.servingStartedAt) / ((SERVICE_CONFIG[ticket.serviceType]?.avgServiceMinutes || 5) * 60 * 1000)) * 100)}%`
                }}
                transition={{ duration: 1, ease: 'linear' }}
                className="h-full bg-emerald-400"
              />
            </div>
          ) : (
            <div className="flex-1 mx-6 border-t-2 border-dashed border-sage/20" />
          )}

          {/* Right notch */}
          <div className="absolute -right-4 w-8 h-8 rounded-full bg-[#F3EFE3] border border-sage/10 z-10" />
        </div>

        {/* ===== TICKET BOTTOM SECTION ===== */}
        <div className="px-7 pt-5 pb-7 bg-white space-y-5">

          {/* Department row */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center text-sage shrink-0">
              <Icon size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-sage/50">{t('department')}</p>
              <p className="text-sm font-bold text-[#2C3639]">{serviceConfig?.label ? t(`${ticket.serviceType}Title`) : 'General'}</p>
            </div>
          </div>

          {/* Patient name if not anonymous */}
          {ticket.patientName && ticket.patientName !== 'Anonymous' && (
            <div>
              <p className="text-[10px] font-bold text-sage/50">{t('patient')}</p>
              <p className="text-sm font-bold text-[#2C3639]">{ticket.patientName}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-4 pt-1 border-t border-sage/10">
            <div>
              <p className="text-[10px] font-bold text-sage/50">{t('issued')}</p>
              <p className="text-xs font-bold text-[#2C3639]">{issuedTime}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-sage/50">{t('dateLabel')}</p>
              <p className="text-xs font-bold text-[#2C3639]">{issuedDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-sage/50 flex items-center gap-1">
                <Clock size={9} /> {t('estWait')}
              </p>
              <p className={cn("text-xs font-bold", isServing ? "text-sage" : "text-[#2C3639]")}>
                {isServing ? "Now!" : `${ticket.estimatedWaitMinutes} min`}
              </p>
            </div>
          </div>

          {/* Position indicator */}
          {ticket.status !== 'completed' && (
            <div className={cn(
              "flex items-center justify-between px-4 py-2 rounded-2xl border",
              statusStyle.bg, statusStyle.border
            )}>
              <span className={cn("text-xs font-bold", statusStyle.text)}>{t('queuePosition')}</span>
              <div className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", statusStyle.dot, isServing && "animate-pulse")} />
                <span className={cn("text-base font-bold", statusStyle.text)}>
                  {isServing ? t('youAreUp') : `#${ticket.position}`}
                </span>
              </div>
            </div>
          )}

          {ticket.status === 'completed' && (
            <Link
              href="/#services"
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-lg bg-sage/10 text-[#2C3639] border border-sage/20 text-sm font-bold hover:bg-[#2C3639] hover:text-white transition-all duration-300"
            >
              {t('getNewTicket')}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}