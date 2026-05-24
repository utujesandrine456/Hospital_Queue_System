'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Clock, ShieldCheck, Wifi, Stethoscope } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'


function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [value, setValue] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })

    useEffect(() => {
        if (!inView) return
        let start = 0
        const duration = 1600
        const step = 16
        const increment = target / (duration / step)
        const timer = setInterval(() => {
            start += increment
            if (start >= target) {
                setValue(target)
                clearInterval(timer)
            } else {
                setValue(Math.floor(start))
            }
        }, step)
        return () => clearInterval(timer)
    }, [inView, target])

    return (
        <span ref={ref}>
            {value}
            {suffix}
        </span>
    )
}


const features = [
    {
        icon: Clock,
        title: { en: 'Real-Time Queuing', fr: 'File en Temps Réel', rw: 'Umurongo wa Kuri Ubwo' },
        desc: {
            en: 'Your position updates live — the moment things move, you know.',
            fr: 'Votre position se met à jour en temps réel.',
            rw: "Umwanya wawe uvuguruzwa ako kanya.",
        },
    },
    {
        icon: Wifi,
        title: { en: 'Offline Support', fr: 'Mode Hors-Ligne', rw: 'Ikorana Nta Murongo' },
        desc: {
            en: 'Keep your ticket even without internet. We sync when you reconnect.',
            fr: 'Gardez votre ticket même sans internet.',
            rw: "Tike yawe iraguma nta murongo, turuvugurura iyo wosubiye kuri internet.",
        },
    },
    {
        icon: ShieldCheck,
        title: { en: 'Privacy First', fr: 'Confidentialité Avant Tout', rw: 'Ibanga Riragijwe' },
        desc: {
            en: 'No account needed. Your data stays on your device.',
            fr: 'Aucun compte requis. Vos données restent sur votre appareil.',
            rw: "Nta konte ihakwa. Amakuru yawe aguma kuri telefone yawe.",
        },
    },
    {
        icon: Stethoscope,
        title: { en: 'Multi-Department', fr: 'Multi-Département', rw: 'Amashami Menshi' },
        desc: {
            en: 'One system covering every department — from labs to pharmacy.',
            fr: "Un seul système couvrant tous les départements.",
            rw: "Sisitemu imwe ikora amashami yose — kuva laboratwari kugeza faramasi.",
        },
    },
]

const stats = [
    { value: 98, suffix: '%', label: { en: 'Patient Satisfaction', fr: 'Satisfaction Patient', rw: 'Ibyishimo by\'Abarwayi' } },
    { value: 8, suffix: 'min', label: { en: 'Average Wait Time', fr: 'Attente Moyenne', rw: 'Igihe Gisanzwe cyo Gutegereza' } },
    { value: 10, suffix: '+', label: { en: 'Departments', fr: 'Départements', rw: 'Amashami' } },
]


export function AboutSection() {
    const { t, language } = useLanguage()

    const lang = language as 'en' | 'fr' | 'rw'

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
    }
    const fadeUp = {
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0, 0.55, 0.45, 1] as const } },
    }

    return (
        <section id="about" className="relative overflow-hidden bg-[#F3EFE3] py-16 md:py-24">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.045]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='70' viewBox='0 0 60 70'%3E%3Cpolygon points='30,2 58,17 58,53 30,68 2,53 2,17' fill='none' stroke='%23769382' stroke-width='1.5'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 70px',
                }}
            />

            {/* ── Decorative sage blob ── */}
            <div
                className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #769382 0%, transparent 70%)' }}
            />
            <div
                className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #769382 0%, transparent 70%)' }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-6">

                {/* ── Top label + heading ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7 }}
                    className="mb-16 text-center"
                >
                    <h2 className="mt-4 text-4xl font-bold text-[#2C3639] md:text-5xl lg:text-6xl leading-tight">
                        {t('aboutTitle')}
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[#2C3639]/55 font-medium leading-relaxed">
                        {t('aboutDesc')}
                    </p>
                </motion.div>

                {/* ── Two-column layout ── */}
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">

                    {/* Left — feature cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        className="grid sm:grid-cols-2 gap-4"
                    >
                        {features.map(({ icon: Icon, title, desc }) => (
                            <motion.div
                                key={title.en}
                                variants={fadeUp}
                                className="group relative rounded-2xl border border-[#769382]/15 bg-white/60 p-6 backdrop-blur-sm
                           transition-all duration-300 hover:border-[#769382]/40 hover:bg-white/80 hover:shadow-lg hover:shadow-[#769382]/10 hover:-translate-y-1"
                            >
                                {/* icon bubble */}
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#769382]/10 transition-colors duration-300 group-hover:bg-[#769382]/20">
                                    <Icon size={20} className="text-[#769382]" strokeWidth={1.8} />
                                </div>
                                <h3 className="mb-2 text-sm font-bold text-[#2C3639]">{title[lang]}</h3>
                                <p className="text-xs leading-relaxed text-[#2C3639]/55">{desc[lang]}</p>

                                {/* corner accent */}
                                <div className="pointer-events-none absolute bottom-0 right-0 h-12 w-12 overflow-hidden rounded-br-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <div className="absolute bottom-0 right-0 h-8 w-8 translate-x-4 translate-y-4 rounded-full bg-[#769382]/20" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Right — stats + visual card */}
                    <motion.div
                        initial={{ opacity: 0, x: 32 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.8, ease: [0, 0.55, 0.45, 1], delay: 0.1 }}
                        className="flex flex-col gap-6"
                    >

                        {/* Big visual card */}
                        <div className="relative overflow-hidden rounded-3xl bg-[#2C3639] p-8 text-white">
                            {/* inner pattern */}
                            <div
                                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='70' viewBox='0 0 60 70'%3E%3Cpolygon points='30,2 58,17 58,53 30,68 2,53 2,17' fill='none' stroke='%23ffffff' stroke-width='1.5'/%3E%3C/svg%3E")`,
                                    backgroundSize: '50px 58px',
                                }}
                            />
                            {/* sage blob */}
                            <div
                                className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full opacity-20"
                                style={{ background: 'radial-gradient(circle, #769382, transparent 70%)' }}
                            />

                            <span className="relative mb-2 block text-xs font-bold uppercase tracking-widest text-[#769382]">
                                MediQueue
                            </span>
                            <h3 className="relative text-2xl font-bold leading-snug">
                                Smart queuing,<br />
                                <span className="text-[#769382]">zero stress.</span>
                            </h3>
                            <p className="relative mt-3 text-sm leading-relaxed text-white/60 max-w-xs">
                                Built for the realities of African healthcare — reliable offline, multilingual, and blazingly fast.
                            </p>

                            {/* Stat row inside dark card */}
                            <div className="relative mt-8 flex gap-6 border-t border-white/10 pt-6">
                                {stats.map((s) => (
                                    <div key={s.label.en} className="flex flex-col">
                                        <span className="text-2xl font-bold text-white">
                                            <Counter target={s.value} suffix={s.suffix} />
                                        </span>
                                        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                            {s.label[lang]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Horizontal "how it works" strip */}
                        <div className="rounded-2xl border border-[#769382]/15 bg-white/60 p-6 backdrop-blur-sm">
                            <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#769382]">
                                How it works
                            </p>
                            <ol className="space-y-3">
                                {[
                                    { n: '01', en: 'Choose your department', fr: 'Choisissez votre département', rw: 'Hitamo ishami ryawe' },
                                    { n: '02', en: 'Receive a digital ticket instantly', fr: 'Recevez un ticket numérique', rw: 'Bona tike ya dijitale ako kanya' },
                                    { n: '03', en: 'Track your position in real-time', fr: 'Suivez votre position en direct', rw: 'Kurikirana umwanya wawe kuri ubwo' },
                                ].map((step) => (
                                    <li key={step.n} className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#769382]/12 text-[10px] font-bold text-[#769382]">
                                            {step.n}
                                        </span>
                                        <span className="text-sm font-medium text-[#2C3639]/70">
                                            {step[lang] ?? step.en}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
