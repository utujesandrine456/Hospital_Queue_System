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

import { PublicTicketView } from '@/components/queue/PublicTicketView'

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
  const [showSplash, setShowSplash] = useState(true)
  const [viewOverride, setViewOverride] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    loadFromStorage()
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 1800)
    return () => clearTimeout(timer)
  }, [loadFromStorage])

  if (!mounted || showSplash) return <FullScreenLoader text={t('preparingExp')} />

  // SINGLE-PAGE FORTRESS: If we have an active ticket, show it directly on the home page
  // This prevents any offline navigation failures.
  if (myTicket && myTicket.status !== 'completed' && !viewOverride) {
    return <PublicTicketView ticketId={myTicket.id} onBack={() => setViewOverride('home')} />
  }

  return (
    <main className="min-h-screen bg-[#F3EFE3] selection:bg-sage/20 overflow-x-hidden pt-20 md:pt-24">
      <Header />

      <div className="relative z-10">
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

        <section id="about" className="py-16 md:py-32 bg-white/40">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-[#2C3639] mb-4 md:mb-8">{t('aboutTitle')}</h2>
            <p className="text-base md:text-lg text-[#2C3639]/60 font-medium max-w-2xl mx-auto leading-relaxed">
              {t('aboutDesc')}
            </p>
          </div>
        </section>

        <ContactSection />
      </div>

      <Footer />
    </main>
  )
}