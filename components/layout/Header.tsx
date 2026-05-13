'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Download } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLanguage } from '@/context/LanguageContext'
import { useQueueStore } from '@/store/queueStore'
export function Header() {
    const { isInstalled, promptInstall } = usePWA()
    const { myTicket } = useQueueStore()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { t } = useLanguage()

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-2',
                isScrolled ? 'py-3' : 'py-6'
            )}
        >
            <div className={cn(
                'max-w-7xl mx-auto rounded-full transition-all duration-500 border border-transparent flex items-center justify-between px-6 py-1',
                isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-2xl shadow-sage/10 border-white/40' : 'bg-transparent'
            )}>
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image src="/images/logo-image.png" alt="MediQueue Logo" width={56} height={56} className="w-12 h-12 lg:w-14 lg:h-14 object-cover rounded-full" priority />
                        <span className="text-2xl lg:text-3xl font-black text-sage tracking-tight">MediQueue</span>
                    </Link>

                    {myTicket && myTicket.status !== 'completed' && (
                        <Link
                            href={`/queue/${myTicket.id}`}
                            className="flex items-center gap-2 px-3 py-1 bg-sage/10 rounded-full text-sage border border-sage/20 hover:bg-sage/20 transition-all group lg:ml-2"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sage"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{t('activeTicketBannerAction')}</span>
                        </Link>
                    )}
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {['home', 'services', 'about', 'contact'].map((item) => (
                        <Link
                            key={item}
                            href={`#${item === 'home' ? '' : item}`}
                            onClick={(e) => {
                                e.preventDefault();
                                const targetId = item === 'home' ? 'hero' : item;
                                const element = document.getElementById(targetId) || (targetId === 'hero' ? document.body : null);
                                if (element) {
                                    const y = element.getBoundingClientRect().top + window.scrollY - 100;
                                    window.scrollTo({ top: targetId === 'hero' ? 0 : y, behavior: 'smooth' });
                                }
                            }}
                            className="group relative text-sm font-bold text-[#2C3639]/70 hover:text-sage transition-colors py-1 capitalize"
                        >
                            {t(item)}
                            <span className="absolute bottom-0 left-1/2 w-full h-[4px] rounded-full bg-sage origin-center -translate-x-1/2 scale-x-0 group-hover:scale-x-60 transition-transform duration-300 ease-out" />
                        </Link>
                    ))}

                    <LanguageSwitcher />

                    <div className="h-6 w-px bg-sage/10 ml-2" />

                    {(!isInstalled) && (
                        <button
                            onClick={promptInstall}
                            className="cursor-pointer ml-2 flex flex-row items-center justify-center gap-2 px-5 py-3 lg:px-6 lg:py-3 bg-[#769382] hover:bg-[#5a7668] text-white rounded-full font-bold shadow-xl shadow-sage/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-sage/40 group whitespace-nowrap overflow-hidden relative"
                        >
                            <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                            <span className="text-xs md:text-sm tracking-wide relative z-10">{t('downloadApp')}</span>
                        </button>
                    )}
                </nav>

                <button
                    className="md:hidden p-2 text-sage hover:bg-sage/5 rounded-xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="absolute top-full left-6 right-6 mt-4 p-6 bg-white/95 backdrop-blur-2xl rounded-4xl border border-white shadow-2xl md:hidden"
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between mb-2">
                                <LanguageSwitcher />
                                {(!isInstalled) && (
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            promptInstall();
                                        }}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-linear-to-r from-sage to-[#5a7668] text-white rounded-full font-bold shadow-xl shadow-sage/30 active:scale-95 transition-all group overflow-hidden relative"
                                    >
                                        <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                        <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                                        <span className="text-sm relative z-10">{t('downloadApp')}</span>
                                    </button>
                                )}
                            </div>
                            {['home', 'services', 'about', 'contact'].map((item) => (
                                <Link
                                    key={item}
                                    href={`#${item === 'home' ? '' : item}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsMobileMenuOpen(false);
                                        const targetId = item === 'home' ? 'hero' : item;
                                        const element = document.getElementById(targetId) || (targetId === 'hero' ? document.body : null);
                                        if (element) {
                                            const y = element.getBoundingClientRect().top + window.scrollY - 100;
                                            window.scrollTo({ top: targetId === 'hero' ? 0 : y, behavior: 'smooth' });
                                        }
                                    }}
                                    className="text-2xl font-bold text-[#2C3639] hover:text-sage transition-colors capitalize"
                                >
                                    {t(item)}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
