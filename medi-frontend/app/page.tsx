'use client'

import { useState, useEffect } from 'react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { ServiceSelector } from '@/components/queue/ServiceSelector'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { ContactSection } from '@/components/home/ContactSection'
import { motion, useScroll, useSpring } from 'framer-motion'
import { FullScreenLoader } from '@/components/ui/Loader'
import { useLanguage } from '@/context/LanguageContext'
import { useQueueStore } from '@/store/queueStore'
import { AboutSection } from '@/components/home/AboutSection'
import { ActiveTicketBanner } from '@/components/queue/ActiveTicketBanner'

export default function HomePage() {
  useNetworkStatus()
  const { t } = useLanguage()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const { loadFromStorage, myTicket } = useQueueStore()
  const [mounted, setMounted] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [viewOverride, setViewOverride] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const checkHydration = () => {
      if (typeof window !== 'undefined') {
        const storage = localStorage.getItem('hospital-queue-store')
        if (storage) setHasHydrated(true)
        else setHasHydrated(true) 
      }
    }
    checkHydration()

    loadFromStorage()
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 1800)
    return () => clearTimeout(timer)
  }, [loadFromStorage])

  if (!mounted || showSplash || !hasHydrated) return <FullScreenLoader text={t('preparingExp')} />

  return (
    <main className="min-h-screen bg-[#F3EFE3] selection:bg-sage/20 overflow-x-hidden pt-20 md:pt-24">
      <Header />

      <div className="relative z-10">
        <ActiveTicketBanner />
        <HeroSection />

        <section id="services" className="relative py-12 md:py-24 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
            >
              <ServiceSelector />
            </motion.div>
          </div>
        </section>

        <AboutSection />

        <ContactSection />
      </div>

      <Footer />
    </main>
  )
}