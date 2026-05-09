'use client'

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { useQueueStore } from '@/store/queueStore'
import { useServiceStore } from '@/store/serviceStore'
import { useState, useEffect } from 'react'



export function HeroSection() {
    const { t } = useLanguage()
    const { allTickets, loadFromStorage } = useQueueStore()
    const { services, loadServices } = useServiceStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        loadFromStorage()
        loadServices()
    }, [loadFromStorage, loadServices])

    return (
        <section className="relative w-full min-h-[calc(100vh-1rem)] md:min-h-screen flex items-center pt-2 pb-12 px-4 md:px-12 overflow-visible bg-[#F3EFE3]">
            <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='70' viewBox='0 0 60 70'%3E%3Cpolygon points='30,2 58,17 58,53 30,68 2,53 2,17' fill='none' stroke='%23769382' stroke-width='1.5'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 70px',
                }}
            />

            <div className="max-w-7xl w-full mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-4 items-center w-full">

                    <div className="space-y-8 pr-0 lg:pr-8 pb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="text-4xl lg:text-7xl font-bold text-[#2C3639]"
                        >
                            {t('heroTitle1')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "circOut" }}
                            className="text-lg text-[#2C3639]/60 font-medium max-w-xl leading-relaxed"
                        >
                            {t('heroDescription')}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
                        >
                            <a href='#services'>
                                <button className="cursor-pointer flex items-center gap-4 bg-sage hover:bg-sage/80 transition-all duration-300 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#769382]/20 group hover:shadow-[#2C3639]/20 hover:scale-[1.02]">
                                    {t('exploreServices')}
                                    <div className="w-8 h-8 rounded-full bg-white text-sage flex items-center justify-center group-hover:text-sage/80 transition-colors shrink-0">
                                        <Play size={14} fill="currentColor" className="ml-0.5" />
                                    </div>
                                </button>
                            </a>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="grid grid-cols-3 gap-4 pt-6 border-t border-[#769382]/15"
                        >
                            {[
                                { value: mounted ? `${allTickets.length}` : '...', label: t('happyPatients') },
                                { value: mounted ? `${services.length}` : '...', label: t('services') },
                                { value: '10+', label: t('doctors') },
                            ].map((stat) => (
                                <div key={stat.label} className="cursor-pointer flex flex-col group">
                                    <span className="text-3xl font-bold text-[#2C3639] group-hover:text-[#769382] transition-colors">
                                        {stat.value}
                                    </span>
                                    <span className="text-xs font-semibold text-[#2C3639]/50 mt-1">{stat.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <div className="relative h-[580px] w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 0.5, scale: 1 }}
                            transition={{ duration: 1.4, ease: "easeOut" }}
                            className="absolute"
                            style={{
                                top: '8%',
                                left: '5%',
                                width: '72%',
                                height: '80%',
                                background: '#769382',
                                borderRadius: '62% 38% 46% 54% / 60% 44% 56% 40%',
                            }}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "circOut", delay: 0.3 }}
                            className="absolute inset-0 flex items-end justify-center z-10"
                        >
                            <Image
                                src="/images/hero_image_Updated.png"
                                alt="MediQueue doctor"
                                width={600}
                                height={600}
                                className="object-contain object-bottom h-[120%] w-auto drop-shadow-2xl select-none"
                                priority
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
