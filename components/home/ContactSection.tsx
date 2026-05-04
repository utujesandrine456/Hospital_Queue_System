'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, ArrowRight, MessageSquare } from 'lucide-react'

export function ContactSection() {
    return (
        <section id="contact" className="relative py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-[#2C3639] rounded-[4rem] overflow-hidden shadow-3xl relative">
                    {/* Decorative Gradient Background */}
                    <div className="absolute inset-0 bg-linear-to-br from-sage/10 to-transparent pointer-events-none" />

                    <div className="grid lg:grid-cols-2">
                        {/* Left Col - Card content */}
                        <div className="p-12 lg:p-24 space-y-12 relative z-10">
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-sage/10 border border-sage/10 text-sage text-xs font-bold italic"
                                >
                                    <MessageSquare size={14} />
                                    Connect with us
                                </motion.div>
                                <h2 className="text-5xl lg:text-7xl font-bold text-cream leading-[0.95]">
                                    Let&apos;s talk about <br />
                                    <span className="text-sage italic">Your Care.</span>
                                </h2>
                                <p className="text-lg text-sage/40 font-medium max-w-md">
                                    Have questions about our queue system or services? Our medical support team is available 24/7.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center text-sage">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-sage/40 italic">Email us</p>
                                        <p className="text-base font-bold text-cream">support@blinkcare.rw</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center text-sage">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-sage/40 italic">Call support</p>
                                        <p className="text-base font-bold text-cream">+250 788 000 000</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <button className="group flex items-center gap-4 px-10 py-5 bg-white text-[#2C3639] rounded-full font-bold text-xl hover:bg-sage hover:text-cream transition-all shadow-xl shadow-white/5 active:scale-95">
                                    Send Message
                                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="relative min-h-[400px] lg:min-h-full bg-sage/5 border-l border-white/5 flex items-center justify-center overflow-hidden">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                className="relative w-96 h-96 border-40 border-sage/10 rounded-full flex items-center justify-center"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="w-48 h-48 bg-sage/20 rounded-full blur-[60px]"
                                />
                                <div className="absolute inset-0 flex items-center justify-center p-12 text-center space-y-4">
                                    <div className="space-y-6">
                                        <MapPin size={48} className="text-sage mx-auto" />
                                        <div className="space-y-2">
                                            <p className="text-2xl font-bold text-cream">Main Care Center</p>
                                            <p className="text-sm text-sage/40 font-bold leading-relaxed px-12">
                                                12th Floor Plaza Building Center <br /> Kigali, Rwanda
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
