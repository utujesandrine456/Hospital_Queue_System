'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

export function OfflineStatus() {
    const { t } = useLanguage()
    const [isReady, setIsReady] = useState(false)
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleStatus = () => setIsOnline(navigator.onLine)
        window.addEventListener('online', handleStatus)
        window.addEventListener('offline', handleStatus)

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
                setIsReady(true)
            })
        }

        return () => {
            window.removeEventListener('online', handleStatus)
            window.removeEventListener('offline', handleStatus)
        }
    }, [])

    return (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
            <AnimatePresence>
                {!isOnline ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg font-bold text-xs"
                    >
                        <WifiOff size={14} />
                        Offline Mode
                    </motion.div>
                ) : isReady ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 px-4 py-2 bg-sage/10 text-sage border border-sage/20 rounded-full backdrop-blur-md shadow-sm font-bold text-xs"
                    >
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Online Mode
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}
