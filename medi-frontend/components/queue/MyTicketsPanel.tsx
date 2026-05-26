'use client'

import { useQueueStore } from '@/store/queueStore'
import { useServiceStore } from '@/store/serviceStore'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Ticket,
    CheckCircle2,
    Clock,
    ChevronRight,
    Loader2,
    Hourglass,
    AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { getIconForService } from './ServiceSelector'
import { useState } from 'react'
import { toast } from 'sonner'

export function MyTicketsPanel() {
    const router = useRouter()
    const { t } = useLanguage()
    const myTickets = useQueueStore(s => s.myTickets)
    const chooseServingTicket = useQueueStore(s => s.chooseServingTicket)
    const { services } = useServiceStore()
    const [isChoosing, setIsChoosing] = useState<string | null>(null)

    const visible = myTickets.filter(
        t => t.status === 'waiting' || t.status === 'serving',
    )
    if (visible.length === 0) return null

    const sorted = [...visible].sort((a, b) => {
        if (a.status === 'serving') return -1
        if (b.status === 'serving') return 1
        if (!a.deferred && b.deferred) return -1
        if (a.deferred && !b.deferred) return 1
        return a.createdAt - b.createdAt
    })
    const concurrentServing = sorted.filter(t => t.status === 'serving')

    const handleChooseActiveService = async (ticketId: string) => {
        setIsChoosing(ticketId)
        const ok = await chooseServingTicket(ticketId)
        if (ok) {
            toast.success(t('serviceChoiceSaved') ?? 'Service selected. Other active call has been moved to the end of its queue.')
            router.push(`/queue/${ticketId}`)
        } else {
            toast.error(t('serviceChoiceFailed') ?? 'Could not save your service choice. Please try again.')
        }
        setIsChoosing(null)
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mt-10"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-sage/15 flex items-center justify-center">
                        <Ticket size={16} className="text-sage" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[#2C3639]">
                            {t('myServicesTitle') ?? 'My booked services'}
                        </h3>
                        <p className="text-xs text-sage/60 font-medium">
                            {sorted.length === 1
                                ? t('oneServiceBooked') ?? '1 service booked'
                                : `${sorted.length} ${t('servicesBooked') ?? 'services booked'}`}
                        </p>
                    </div>
                </div>

                {concurrentServing.length > 1 && (
                    <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50/90 p-4">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle size={16} className="text-amber-700 mt-0.5 shrink-0" />
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-amber-900">
                                    {t('chooseServiceNow') ?? 'You are being called in multiple services at the same time.'}
                                </p>
                                <p className="text-xs text-amber-800/90">
                                    {t('chooseServiceNowHint') ?? 'Choose where you will go now. The other ticket will stay valid and move to the end of that queue.'}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {concurrentServing.map(ticket => {
                                        const svc = services.find(s => s.type === ticket.serviceType)
                                        const label = svc?.label ?? ticket.serviceType
                                        const loading = isChoosing === ticket.id
                                        return (
                                            <button
                                                key={`choose-${ticket.id}`}
                                                type="button"
                                                onClick={() => handleChooseActiveService(ticket.id)}
                                                disabled={Boolean(isChoosing)}
                                                className="px-3 py-1.5 rounded-lg bg-sage text-cream text-xs font-bold disabled:opacity-70"
                                            >
                                                {loading ? (t('saving') ?? 'Saving...') : `${t('chooseLabel') ?? 'Choose'} ${label}`}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cards */}
                <div className="space-y-3">
                    {sorted.map((ticket, idx) => {
                        const svc = services.find(s => s.type === ticket.serviceType)
                        const Icon = getIconForService(svc ?? { type: ticket.serviceType, label: ticket.serviceType })
                        const isServing = ticket.status === 'serving'
                        const isDeferred = ticket.deferred

                        return (
                            <motion.button
                                key={ticket.id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.07 }}
                                onClick={() => router.push(`/queue/${ticket.id}`)}
                                className={cn(
                                    'w-full group text-left rounded-2xl border transition-all duration-300 overflow-hidden',
                                    isServing
                                        ? 'bg-sage border-sage/30 shadow-lg shadow-sage/20'
                                        : isDeferred
                                            ? 'bg-white border-sage/10 opacity-80'
                                            : 'bg-white border-sage/15 hover:border-sage/30 hover:shadow-md hover:shadow-sage/10',
                                )}
                            >
                                <div className="flex items-center gap-4 p-4">
                                    {/* Icon */}
                                    <div
                                        className={cn(
                                            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                                            isServing
                                                ? 'bg-white/20 text-cream'
                                                : isDeferred
                                                    ? 'bg-sage/8 text-sage/50'
                                                    : 'bg-sage/10 text-sage group-hover:bg-sage/20',
                                        )}
                                    >
                                        <Icon size={22} strokeWidth={2} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span
                                                className={cn(
                                                    'text-xs font-bold',
                                                    isServing ? 'text-cream/70' : 'text-sage/50',
                                                )}
                                            >
                                                {ticket.ticketNumber}
                                            </span>

                                            {/* Status pill */}
                                            {isServing && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold text-cream">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                                    {t('nowServing') ?? 'Serving now'}
                                                </span>
                                            )}
                                            {!isServing && !isDeferred && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-700">
                                                    <Clock size={9} />
                                                    #{ticket.position} {t('inQueue') ?? 'in queue'}
                                                </span>
                                            )}
                                            {isDeferred && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2C3639]/5 text-[10px] font-semibold text-[#2C3639]/50">
                                                    <Hourglass size={9} />
                                                    {t('deferredLabel') ?? 'Waiting its turn'}
                                                </span>
                                            )}
                                        </div>

                                        <p
                                            className={cn(
                                                'text-sm font-bold leading-tight truncate',
                                                isServing ? 'text-cream' : 'text-[#2C3639]',
                                            )}
                                        >
                                            {svc?.label ?? ticket.serviceType}
                                        </p>

                                        {isDeferred && (
                                            <p className="text-[10px] text-sage/50 font-medium mt-0.5">
                                                {t('deferredHint') ?? 'Will activate after your current service'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Arrow */}
                                    <div
                                        className={cn(
                                            'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                                            isServing
                                                ? 'bg-white/15 text-cream'
                                                : 'bg-sage/8 text-sage/50 group-hover:bg-sage group-hover:text-white',
                                        )}
                                    >
                                        {isDeferred ? (
                                            <Loader2 size={14} className="animate-spin opacity-40" />
                                        ) : (
                                            <ChevronRight size={15} strokeWidth={2.5} />
                                        )}
                                    </div>
                                </div>

                                {/* Serving progress bar */}
                                {isServing && (
                                    <div className="h-0.5 bg-white/10">
                                        <motion.div
                                            className="h-full bg-white/40"
                                            initial={{ width: '100%' }}
                                            animate={{ width: '0%' }}
                                            transition={{ duration: (svc?.avgServiceMinutes ?? 5) * 60, ease: 'linear' }}
                                        />
                                    </div>
                                )}
                            </motion.button>
                        )
                    })}
                </div>

                {/* Complete all notice when all done */}
                {visible.length > 1 && (
                    <p className="text-center text-xs text-[#2C3639]/30 font-medium mt-4">
                        {t('sequentialNote') ?? 'Each service activates automatically after the previous one is complete'}
                    </p>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
