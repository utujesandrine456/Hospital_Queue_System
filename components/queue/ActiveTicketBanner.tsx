'use client'

import { useQueueStore } from '@/store/queueStore'
import { useLanguage } from '@/context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function ActiveTicketBanner() {
    const { myTicket, loadFromStorage } = useQueueStore()
    const { t } = useLanguage()
    const [mounted, setMounted] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        setMounted(true)
        loadFromStorage()
    }, [loadFromStorage])

    useEffect(() => {
        if (mounted && myTicket && myTicket.status !== 'completed' && isVisible) {
            const duration = 5000
            const interval = 30
            const step = (interval / duration) * 100

            const timer = setInterval(() => {
                setProgress((prev) => {
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

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -40, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.3 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none"
                >
                    <div className="pointer-events-auto relative group max-w-sm w-full">
                        {/* Interactive Outer Glow */}
                        <div className="absolute -inset-0.5 bg-linear-to-r from-sage/50 to-beige/50 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                        <div className="relative overflow-hidden bg-white/80 backdrop-blur-2xl border border-white/50 rounded-4xl shadow-[0_15px_40px_-10px_rgba(118,147,130,0.3)]">
                            <Link
                                href={`/queue/${myTicket.id}`}
                                className="flex items-center gap-4 p-4 pr-12"
                            >
                                {/* Premium Icon Block */}
                                <div className="relative shrink-0">
                                    <div className="relative w-11 h-11 rounded-2xl bg-[#769382] flex items-center justify-center text-white shadow-lg shadow-sage/20 group-hover:rotate-10 transition-transform duration-500">
                                        <Ticket size={22} strokeWidth={2.5} />
                                    </div>
                                </div>

                                <div className="grow min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
                                        <span className="text-[9px] font-black tracking-[0.25em] text-sage uppercase opacity-90">
                                            {t('activeTicketBannerTitle')}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-[#2C3639] truncate">
                                        <span className="opacity-50 font-medium whitespace-nowrap mr-1">#{myTicket.id.slice(-6).toUpperCase()}</span>
                                        {myTicket.serviceType.toUpperCase()}
                                    </p>
                                </div>

                                <div className="shrink-0 w-8 h-8 rounded-full bg-sage/5 flex items-center justify-center text-sage group-hover:bg-sage group-hover:text-white transition-all duration-500">
                                    <ArrowRight size={16} strokeWidth={3} />
                                </div>
                            </Link>

                            {/* Elegant Dismiss Button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    setIsVisible(false)
                                }}
                                className="absolute top-1/2 -translate-y-1/2 right-4 p-1.5 rounded-xl hover:bg-black/5 text-slate-400 hover:text-sage transition-all duration-300"
                                aria-label="Dismiss"
                            >
                                <X size={16} strokeWidth={2.5} />
                            </button>

                            {/* Minimalist Progress Loader */}
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-100/50">
                                <motion.div
                                    className="h-full bg-linear-to-r from-sage via-sage to-beige"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ ease: "linear", duration: 0.03 }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
