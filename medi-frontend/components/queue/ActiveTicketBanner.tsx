'use client'

import { useQueueStore } from '@/store/queueStore'
import { useServiceStore } from '@/store/serviceStore'
import { useLanguage } from '@/context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, ArrowRight, X, Sparkles, Clock, Layers } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { SERVICE_CONFIG } from '@/lib/queue/engine'

function useHasApiAlert() {
  const apiError = useQueueStore(s => s.apiError)
  const loadError = useServiceStore(s => s.loadError)
  return Boolean(apiError || loadError)
}

export function ActiveTicketBanner() {
  const router = useRouter()
  const { myTicket, myTickets, loadFromStorage } = useQueueStore()
  const { t } = useLanguage()
  const hasApiAlert = useHasApiAlert()
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    setMounted(true)
    loadFromStorage()
  }, [loadFromStorage])

  useEffect(() => {
    if (myTicket && myTicket.status !== 'completed') {
      setIsVisible(true)
      setProgress(100)
    }
  }, [myTicket?.id, myTicket?.status])

  useEffect(() => {
    if (mounted && myTicket && myTicket.status !== 'completed' && isVisible) {
      const duration = 8000
      const interval = 40
      const step = (interval / duration) * 100

      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(timer)
            setTimeout(() => setIsVisible(false), 200)
            return 0
          }
          return prev - step
        })
      }, interval)

      return () => clearInterval(timer)
    }
  }, [mounted, myTicket, isVisible])

  if (!mounted || !myTicket || myTicket.status === 'completed') return null

  const serviceLabel =
    SERVICE_CONFIG[myTicket.serviceType]?.label ?? myTicket.serviceType
  const isServing = myTicket.status === 'serving'
  const statusLabel = isServing
    ? t('nowServing')
    : myTicket.position === 1
      ? t('youAreUp') ?? "You're next"
      : `#${myTicket.position} in queue`

  const topOffset = hasApiAlert
    ? 'calc(var(--header-height) + 6.25rem)'
    : 'var(--notification-top)'

  // Extra tickets beyond the active one
  const extraCount = myTickets.filter(
    t => t.id !== myTicket.id && (t.status === 'waiting' || t.status === 'serving'),
  ).length

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96, transition: { duration: 0.25 } }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="fixed left-0 right-0 z-45 flex justify-center px-4 pointer-events-none"
          style={{ top: topOffset }}
        >
          <div className="pointer-events-auto w-full max-w-lg relative">
            <div className="absolute -inset-0.5 rounded-4xl bg-linear-to-r from-sage via-[#8aa894] to-[#2C3639] opacity-30 blur-md animate-pulse" />

            <div className="relative overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/90 backdrop-blur-2xl shadow-[0_24px_60px_-16px_rgba(44,54,57,0.35)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sage/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <button
                type="button"
                onClick={() => router.push(`/queue/${myTicket.id}`)}
                className="relative flex items-center gap-4 p-4 pr-14 group w-full text-left"
              >
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-105',
                      isServing
                        ? 'bg-sage shadow-sage/30'
                        : 'bg-[#2C3639] shadow-[#2C3639]/20',
                    )}
                  >
                    <Ticket size={26} strokeWidth={2.5} />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                    <Sparkles size={10} className="text-white" strokeWidth={3} />
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        isServing ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
                      )}
                    />
                    <span className="text-[10px] font-bold text-sage">
                      {t('activeTicketBannerTitle')}
                    </span>
                  </div>
                  <p className="text-base font-black text-[#2C3639] truncate leading-tight">
                    {myTicket.ticketNumber}
                  </p>
                  <p className="text-xs font-bold text-sage/80 mt-0.5 truncate">{serviceLabel}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold',
                        isServing
                          ? 'bg-sage/15 text-sage'
                          : 'bg-amber-50 text-amber-800 border border-amber-100',
                      )}
                    >
                      {isServing ? <Sparkles size={10} /> : <Clock size={10} />}
                      {statusLabel}
                    </span>
                    {myTicket.estimatedWaitMinutes > 0 && !isServing && (
                      <span className="text-[10px] font-bold text-[#2C3639]/45">
                        ~{myTicket.estimatedWaitMinutes} min
                      </span>
                    )}
                    {/* Extra services pill */}
                    {extraCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#2C3639]/8 text-[#2C3639]/60">
                        <Layers size={9} />
                        +{extraCount} {extraCount === 1 ? (t('moreService') ?? 'more service') : (t('moreServices') ?? 'more services')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-sage group-hover:bg-sage group-hover:text-white transition-all duration-300">
                    <ArrowRight size={18} strokeWidth={3} />
                  </div>
                  <span className="text-[9px] font-bold text-sage/50 group-hover:text-sage">
                    {t('activeTicketBannerAction')}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  setIsVisible(false)
                }}
                className="absolute top-3 right-3 p-2 rounded-xl text-[#2C3639]/30 hover:text-[#2C3639] hover:bg-black/5 transition-colors"
                aria-label="Dismiss"
              >
                <X size={18} strokeWidth={2.5} />
              </button>

              <div className="h-1 bg-[#2C3639]/5">
                <motion.div
                  className="h-full bg-linear-to-r from-sage via-[#8aa894] to-sage"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.04 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
