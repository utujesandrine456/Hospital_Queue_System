'use client'

import { motion } from 'framer-motion'
import { HeartPulse, Mail, Phone, MapPin, Globe, Share2, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
    return (
        <footer className="relative bg-[#2C3639] text-cream mt-16">
            <div className="absolute top-0 left-0 right-0 -translate-y-full overflow-hidden leading-none rotate-180">
                <svg className="relative block w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#2C3639"></path>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24">
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-sage flex items-center justify-center text-cream shadow-xl">
                                <HeartPulse size={28} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold leading-none">BlinkCare</span>
                            </div>
                        </Link>
                        <p className="text-sage/40 text-sm font-medium leading-relaxed">
                            Transforming patient experiences through intelligent technology and compassionate care. Offline-first and always synced.
                        </p>
                        <div className="flex items-center gap-5">
                            {[Globe, Share2, MessageSquare].map((Icon, i) => (
                                <button key={i} className="text-sage/30 hover:text-sage transition-colors duration-300">
                                    <Icon size={20} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-8">
                        <h4 className="text-lg font-bold italic">Departments</h4>
                        <nav className="flex flex-col gap-4">
                            {['Consultation', 'Laboratory', 'Pharmacy', 'Radiology'].map((item) => (
                                <Link key={item} href="#" className="text-sm font-bold text-sage/40 hover:text-sage transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Support */}
                    <div className="space-y-8">
                        <h4 className="text-lg font-bold italic">Patient Care</h4>
                        <nav className="flex flex-col gap-4">
                            {['Virtual Queue', 'How it works', 'Offline Access', 'Terms of Care'].map((item) => (
                                <Link key={item} href="#" className="text-sm font-bold text-sage/40 hover:text-sage transition-colors">
                                    {item}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contact */}
                    <div className="space-y-8">
                        <h4 className="text-lg font-bold italic">Get in touch</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sage/40">
                                <Phone size={18} />
                                <span className="text-sm font-bold">+250 788 000 000</span>
                            </div>
                            <div className="flex items-center gap-4 text-sage/40">
                                <Mail size={18} />
                                <span className="text-sm font-bold">care@blinkcare.rw</span>
                            </div>
                            <div className="flex items-center gap-4 text-sage/40">
                                <MapPin size={18} />
                                <span className="text-sm font-bold leading-relaxed">KN 20 St, Kigali City, Rwanda</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-sage/5 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
                    <p className="text-xs font-bold text-sage/20">
                        © 2026 BlinkCare. Designed for the Future of Healthcare.
                    </p>
                </div>
            </div>
        </footer>
    )
}
