'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface LoaderProps {
    text?: string
}

export function FullScreenLoader({ text = "Preparing your experience..." }: LoaderProps) {
    return (
        <main className="fixed inset-0 z-100 h-screen w-screen bg-[#F3EFE3] flex flex-col items-center justify-center overflow-hidden">
            {/* Elegant Noise & Orbs Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-linear-to-br from-[#F3EFE3] via-[#EAF2ED] to-[#F3EFE3]" />
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#769382]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-[#769382]/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    className="relative flex items-center justify-center"
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 3, delay: i * 1, ease: "easeOut" }}
                            className="absolute rounded-full bg-linear-to-r from-[#769382]/40 to-[#769382]/10"
                            style={{ width: '120px', height: '120px' }}
                        />
                    ))}

                    <div className="relative w-32 h-32 rounded-full bg-white/40 backdrop-blur-xl shadow-[0_0_60px_rgba(118,147,130,0.3)] flex items-center justify-center overflow-hidden border border-white/60 z-10 rotate-3">
                        <motion.div
                            animate={{ rotate: [-3, 3, -3] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        >
                            <Image src="/images/logo-image.png" alt="MediQueue" width={80} height={80} className="object-cover w-24 h-24" priority />
                        </motion.div>
                    </div>
                </motion.div>

                <div className="mt-16 flex flex-col items-center w-full max-w-md">
                    <motion.div className="flex gap-0.5">
                        {"MEDIQUEUE".split("").map((char, i) => (
                            <motion.span
                                key={i}
                                custom={i}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                className="text-4xl lg:text-5xl font-black text-[#2C3639] tracking-tighter"
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.div>

                    {/* ECG SVG Animation */}
                    <div className="w-full h-16 mt-2 relative -ml-4">
                        <svg viewBox="0 0 200 50" className="w-full h-full overflow-visible drop-shadow-[0_0_12px_#769382]">
                            {/* Static faint track */}
                            <path
                                d="M 0 25 H 60 L 70 10 L 85 45 L 100 5 L 115 35 L 125 25 H 200"
                                fill="transparent"
                                stroke="#769382"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-10"
                            />
                            {/* Animated glowing path */}
                            <motion.path
                                d="M 0 25 H 60 L 70 10 L 85 45 L 100 5 L 115 35 L 125 25 H 200"
                                fill="transparent"
                                stroke="#769382"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                                transition={{
                                    pathLength: { duration: 2, ease: "easeInOut", repeat: Infinity },
                                    opacity: { duration: 2, repeat: Infinity }
                                }}
                            />
                        </svg>
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="text-[#769382] font-semibold text-md mt-2"
                    >
                        {text}
                    </motion.p>
                </div>
            </div>
        </main>
    )
}
