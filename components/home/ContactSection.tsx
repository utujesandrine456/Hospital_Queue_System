'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, Send, CheckCheck, Activity } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

interface Message {
    id: number
    text: string
    from: 'user' | 'support'
    time: string
}



function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}



export function ContactSection() {
    const { t } = useLanguage()
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: t('chatWelcome'),
            from: 'support',
            time: '09:00 AM',
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const AUTO_REPLIES = [
        t('chatAuto1'),
        t('chatAuto2'),
        t('chatAuto3'),
    ]

    function getAutoReply() {
        return AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]
    }

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [messages, isTyping])

    const sendMessage = () => {
        const text = input.trim()
        if (!text) return

        const userMsg: Message = { id: Date.now(), text, from: 'user', time: getTime() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        setTimeout(() => {
            setIsTyping(false)
            const reply: Message = {
                id: Date.now() + 1,
                text: getAutoReply(),
                from: 'support',
                time: getTime(),
            }
            setMessages(prev => [...prev, reply])
        }, 2000)
    }

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') sendMessage()
    }

    return (
        <section id="contact" className="relative py-16 bg-cream overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="relative rounded-4xl py-12 px-6 md:py-16 md:px-12 mx-4 md:mx-16 bg-[#2C3639] overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-sage/5 rounded-full blur-[100px] -mr-48 -mt-48" />

                    <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-12"
                        >
                            <div>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-cream leading-none tracking-tight">
                                    {t('contactTitle1')} <br />
                                    <span className="text-sage italic">{t('contactTitle2')}</span>
                                </h2>
                                <p className="mt-8 text-lg text-cream/60 max-w-lg font-medium leading-relaxed">
                                    {t('contactDesc')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    {
                                        icon: <Mail size={22} />,
                                        label: t('emailSupport'),
                                        value: 'ingogatechnologies@gmail.com',
                                        detail: t('emailDesc'),
                                    },
                                    {
                                        icon: <Phone size={22} />,
                                        label: t('phoneCall'),
                                        value: '+250 784 376 747',
                                        detail: t('phoneDesc'),
                                    },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 * i }}
                                        className="cursor-pointer group flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-sage/30 hover:bg-white/10 transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 shrink-0 rounded-full bg-sage/10 border border-sage/20 flex items-center justify-center text-sage group-hover:bg-sage group-hover:text-cream transition-all duration-300">
                                            {item.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-semibold text-cream/30 mb-1">{item.label}</p>
                                            <p className="text-md font-bold text-cream truncate">{item.value}</p>
                                            <p className="text-sm text-cream/40 font-medium mt-0.5">{item.detail}</p>
                                        </div>
                                    </motion.div>
                                ))}

                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="flex items-center justify-center"
                        >
                            <div
                                className="relative w-[340px] rounded-[4rem] border-12 border-white/5 bg-[#1F2629]"
                            >
                                <div className="absolute right-[-14px] top-32 w-[3px] h-16 rounded-l-full bg-white/10" />
                                <div className="absolute left-[-14px] top-28 w-[3px] h-12 rounded-r-full bg-white/10" />
                                <div className="absolute left-[-14px] top-44 w-[3px] h-12 rounded-r-full bg-white/10" />

                                <div className="rounded-[3.2rem] overflow-hidden bg-cream">
                                    <div className="flex items-center justify-between px-10 pt-6 pb-3 bg-white/40 backdrop-blur-md rounded-t-[3rem]">
                                        <span className="text-[12px] font-black text-[#2C3639]">9:41</span>
                                        <div className="w-24 h-7 bg-black rounded-full" />
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#2C3639]" />
                                            <div className="w-6 h-3 rounded-sm border border-[#2C3639]/30 p-px">
                                                <div className="w-full h-full bg-[#2C3639]/80 rounded-sm" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chat Header */}
                                    <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-[#2C3639]/5 shadow-sm">
                                        <div className="w-14 h-14 rounded-fulflex items-center justify-center shrink-0 overflow-hidden">
                                            <Image src="/images/logo-image.png" alt="MQ" width={56} height={56} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[16px] font-semibold text-[#2C3639]">MediQueue Care</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="w-2 h-2 rounded-full bg-sage animate-pulse shadow-[0_0_8px_#769382]" />
                                                <span className="text-[12px] text-sage font-medium px-1">{t('liveHelp')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div ref={scrollContainerRef} className="h-[320px] overflow-y-auto px-6 py-8 space-y-6 bg-cream scrollbar-none">
                                        <AnimatePresence initial={false}>
                                            {messages.map(msg => (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                                                >
                                                    <div className={`max-w-[85%] flex flex-col gap-2 ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                                                        <div
                                                            className={`px-5 py-4 rounded-3xl text-[13px] leading-relaxed font-semibold shadow-sm ${msg.from === 'user'
                                                                ? 'bg-[#2C3639] text-cream rounded-br-none'
                                                                : 'bg-white text-[#2C3639] border border-[#2C3639]/5 rounded-bl-none'
                                                                }`}
                                                        >
                                                            {msg.text}
                                                        </div>
                                                        <div className="flex items-center gap-2 px-2">
                                                            <span className="text-[12px] text-[#2C3639]/40 font-medium">{msg.time}</span>
                                                            {msg.from === 'user' && <CheckCheck size={14} className="text-sage" />}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {isTyping && (
                                                <motion.div
                                                    key="typing"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-end gap-2 justify-start"
                                                >
                                                    <div className="px-6 py-5 rounded-3xl bg-white border border-[#2C3639]/5 rounded-bl-none shadow-sm">
                                                        <div className="flex gap-2.5 items-center">
                                                            {[0, 1, 2].map(i => (
                                                                <motion.span
                                                                    key={i}
                                                                    className="w-2 h-2 rounded-full bg-sage/40"
                                                                    animate={{ y: [0, -6, 0] }}
                                                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Input Bar */}
                                    <div className="p-2 bg-white border-t border-[#2C3639]/5">
                                        <div className="flex items-center gap-3 bg-cream rounded-md px-4 py-1 border border-[#2C3639]/5 group-focus-within:border-sage transition-all">
                                            <input
                                                type="text"
                                                value={input}
                                                onChange={e => setInput(e.target.value)}
                                                onKeyDown={handleKey}
                                                placeholder={t('typeMessage')}
                                                className="flex-1 bg-transparent text-[13px] text-[#2C3639] placeholder:text-[#2C3639]/20 outline-none font-medium"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={sendMessage}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${input.trim()
                                                    ? 'bg-sage text-cream shadow-sage/30'
                                                    : 'bg-sage/60 text-cream/60'
                                                    }`}
                                            >
                                                <Send size={16} />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Home Indicator */}
                                    <div className="flex justify-center pb-5 pt-2 bg-white">
                                        <div className="w-24 h-1.5 rounded-full bg-[#2C3639]/10" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
