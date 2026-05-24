'use client'

import { useState, useEffect } from 'react'
import { WifiOff, CheckCircle2, Radio } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { usePathname } from 'next/navigation'

export function OfflineStatus() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', handleStatus)
    window.addEventListener('offline', handleStatus)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setIsReady(true))
    }

    return () => {
      window.removeEventListener('online', handleStatus)
      window.removeEventListener('offline', handleStatus)
    }
  }, [])

  if (pathname === '/login') return null

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence mode="wait">
        {!isOnline ? (
          <motion.div
            key="offline"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex items-center gap-2.5 pl-4 pr-5 py-2.5 bg-[#2C3639] text-cream rounded-2xl shadow-2xl shadow-black/25 font-bold text-xs border border-white/10"
          >
            <WifiOff size={15} className="text-amber-400" />
            Offline mode
          </motion.div>
        ) : isReady ? (
          <motion.div
            key="online"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-white/90 backdrop-blur-xl text-sage border border-sage/20 rounded-2xl shadow-xl shadow-sage/15 font-bold text-xs"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-40" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sage" />
            </span>
            <Radio size={14} className="opacity-70" />
            Live sync
            <CheckCircle2 size={14} className="text-sage" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
