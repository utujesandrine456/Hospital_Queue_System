'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)

    const languages = [
        { code: 'en', label: 'English', short: 'EN' },
        { code: 'fr', label: 'Français', short: 'FR' },
        { code: 'rw', label: 'Kinyarwanda', short: 'RW' },
    ]

    const currentLang = languages.find(l => l.code === language) || languages[0]

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-sage/20 bg-white/50 hover:bg-sage/10 transition-colors"
            >
                <Globe size={18} className="text-sage" />
                <span className="text-sm font-bold text-[#2C3639]">{currentLang.short}</span>
                <ChevronDown size={14} className={`text-sage transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-40 bg-white shadow-xl shadow-sage/10 rounded-2xl border border-sage/10 overflow-hidden z-50 p-2"
                        >
                            <div className="flex flex-col gap-1">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code as any)
                                            setIsOpen(false)
                                        }}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${language === lang.code
                                                ? 'bg-sage text-white font-bold'
                                                : 'text-[#2C3639] hover:bg-sage/5'
                                            }`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
