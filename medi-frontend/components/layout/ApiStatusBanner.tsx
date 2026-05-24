'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Server } from 'lucide-react'
import { useQueueStore } from '@/store/queueStore'
import { useServiceStore } from '@/store/serviceStore'

export function ApiStatusBanner() {
  const pathname = usePathname()
  const apiError = useQueueStore(s => s.apiError)
  const loadError = useServiceStore(s => s.loadError)
  const [dismissed, setDismissed] = useState(false)

  if (pathname === '/login' || pathname?.startsWith('/login')) return null

  const message = apiError || loadError
  if (!message || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        role="alert"
        initial={{ opacity: 0, y: -16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="fixed left-0 right-0 z-44 flex justify-center px-4 pointer-events-none"
        style={{ top: 'var(--notification-top)' }}
      >
        <div className="pointer-events-auto w-full max-w-2xl relative group">
          <div className="absolute -inset-px rounded-2xl bg-linear-to-r from-amber-400/60 via-amber-500/40 to-sage/50 opacity-80 blur-sm" />
          <div className="relative flex items-start gap-4 rounded-2xl border border-amber-200/80 bg-white/95 backdrop-blur-xl px-5 py-4 shadow-[0_20px_50px_-12px_rgba(118,147,130,0.35)]">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <AlertTriangle className="text-amber-600" size={22} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-black text-[#2C3639] tracking-tight">Connection issue</p>
              <p className="text-sm font-semibold text-amber-900/90 mt-1 leading-snug">{message}</p>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-sage/70 mt-2">
                <Server size={12} />
                Expected API: {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:2000'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="shrink-0 p-2 rounded-xl text-[#2C3639]/40 hover:text-[#2C3639] hover:bg-amber-50 transition-colors"
              aria-label="Dismiss"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
