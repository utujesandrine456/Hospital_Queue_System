'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartPulse, Menu, X, ShieldCheck, Activity } from 'lucide-react'
import { useNetworkStore } from '@/store/networkStore'
import { cn } from '@/lib/utils'
import Image from 'next/image'
export function Header() {
    const { isOnline } = useNetworkStore()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

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
                'fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4',
                isScrolled ? 'py-3' : 'py-6'
            )}
        >
            <div className={cn(
                'max-w-7xl mx-auto rounded-full transition-all duration-500 border border-transparent flex items-center justify-between px-6 py-3',
                isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-2xl shadow-sage/10 border-white/40' : 'bg-transparent'
            )}>
                <Link href="/" className="flex items-center gap-3 group">
                    <Image src="/images/logo.png" alt="MediQueue Logo" width={56} height={56} className="w-12 h-12 lg:w-14 lg:h-14 object-cover rounded-full shadow-lg border-2 border-white/50" priority />
                    <span className="text-2xl lg:text-3xl font-black text-sage tracking-tight">MediQueue</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {['Home', 'Services', 'About', 'Contact'].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                            onClick={(e) => {
                                e.preventDefault();
                                const targetId = item.toLowerCase() === 'home' ? 'hero' : item.toLowerCase();
                                const element = document.getElementById(targetId) || (targetId === 'hero' ? document.body : null);
                                if (element) {
                                    const y = element.getBoundingClientRect().top + window.scrollY - 100;
                                    window.scrollTo({ top: targetId === 'hero' ? 0 : y, behavior: 'smooth' });
                                }
                            }}
                            className="group relative text-sm font-bold text-[#2C3639]/70 hover:text-sage transition-colors py-1"
                        >
                            {item}
                            <span className="absolute bottom-0 left-1/2 w-full h-[4px] rounded-full bg-sage origin-center -translate-x-1/2 scale-x-0 group-hover:scale-x-60 transition-transform duration-300 ease-out" />
                        </Link>
                    ))}

                    <div className="h-6 w-px bg-sage/10 ml-2" />

                    <div className="flex items-center gap-3 pl-2">
                        <div className={cn(
                            "w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                            (mounted && isOnline) ? "bg-sage shadow-sage/40" : "bg-red-400 animate-pulse"
                        )} />
                        <span className="text-sm font-bold text-[#2C3639]/60">
                            {(mounted && isOnline) ? 'System Live' : 'Syncing Offline'}
                        </span>
                    </div>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-sage hover:bg-sage/5 rounded-xl transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="absolute top-full left-6 right-6 mt-4 p-6 bg-white/95 backdrop-blur-2xl rounded-4xl border border-white shadow-2xl md:hidden"
                    >
                        <div className="flex flex-col gap-6">
                            {['Home', 'Services', 'About', 'Contact'].map((item) => (
                                <Link
                                    key={item}
                                    href={`#${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsMobileMenuOpen(false);
                                        const targetId = item.toLowerCase() === 'home' ? 'hero' : item.toLowerCase();
                                        const element = document.getElementById(targetId) || (targetId === 'hero' ? document.body : null);
                                        if (element) {
                                            const y = element.getBoundingClientRect().top + window.scrollY - 100;
                                            window.scrollTo({ top: targetId === 'hero' ? 0 : y, behavior: 'smooth' });
                                        }
                                    }}
                                    className="text-2xl font-bold text-[#2C3639] hover:text-sage transition-colors"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    )
}
