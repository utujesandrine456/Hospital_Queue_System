'use client'

import { useState, useEffect } from 'react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { ServiceSelector } from '@/components/queue/ServiceSelector'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { ContactSection } from '@/components/home/ContactSection'
import { motion, useScroll, useSpring } from 'framer-motion'

export default function HomePage() {
  useNetworkStatus()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-[#F3EFE3] selection:bg-sage/20 overflow-x-hidden pt-20">
      <Header />

      <div className="relative z-10">
        <HeroSection />

        <section id="services" className="relative py-32 px-6">
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

        <section id="about" className="py-32 bg-white/40">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl lg:text-6xl font-bold text-[#2C3639] mb-8">Redefining Patient Care.</h2>
            <p className="text-lg text-[#2C3639]/60 font-medium max-w-2xl mx-auto leading-relaxed">
              Our system combines advanced queue deterministic algorithms with an intuitive interface to ensure you never lose your spot, even when offline.
            </p>
          </div>
        </section>

        <ContactSection />
      </div>  

      <Footer />
    </main>
  )
}