'use client'

import { useQueueStore } from '@/store/queueStore'
import { useLanguage } from '@/context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function ActiveTicketBanner() {
    const { myTicket, loadFromStorage } = useQueueStore()
    const { t } = useLanguage()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        loadFromStorage()
    }, [loadFromStorage])

    if (!mounted || !myTicket || myTicket.status === 'completed') return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto px-6 mb-4"
            >
                <Link
                    href={`/queue/${myTicket.id}`}
                    className="group flex items-center justify-between p-4 bg-white/40 backdrop-blur-md border border-sage/20 rounded-2xl hover:bg-white/60 transition-all duration-300 shadow-lg shadow-sage/5"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-sage group-hover:scale-110 transition-transform duration-500">
                            <Ticket size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-sage uppercase tracking-widest mb-0.5">
                                {t('activeTicketBannerTitle')}
                            </p>
                            <p className="text-sm font-bold text-[#2C3639]">
                                #{myTicket.id.slice(-6).toUpperCase()} • {myTicket.serviceType.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-sage">
                        <span className="hidden sm:inline">{t('activeTicketBannerAction')}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </motion.div>
        </AnimatePresence>
    )
}
