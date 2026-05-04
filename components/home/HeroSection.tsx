'use client'

import { motion } from 'framer-motion'
import { Play, Search } from 'lucide-react'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-0 overflow-visible bg-[#F3EFE3]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-16">
          {/* Left Column */}
          <div className="space-y-8 pr-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="text-5xl lg:text-7xl font-bold text-[#2C3639] leading-[1.1] tracking-normal"
            >
              Premium Treatments for <br />
              a Healthy Lifestyle
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "circOut" }}
              className="text-lg text-sage/70 font-medium max-w-xl leading-relaxed"
            >
              Seamlessly advance scalable architectures with future-ready growth strategies. Efficiently implement low-risk, high-return process enhancements tailored for mission-critical testing procedures, especially in publishing and related industries.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
              className="pt-4"
            >
              <button className="flex items-center gap-4 bg-[#8EACB6] hover:bg-sage transition-colors text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-sage/20 group">
                View Our Hospital
                <div className="w-8 h-8 rounded-full bg-white text-[#8EACB6] flex items-center justify-center group-hover:text-sage transition-colors">
                  <Play size={16} fill="currentColor" className="ml-1" />
                </div>
              </button>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="relative h-[600px] w-full flex justify-end">
            {/* Abstract Blob Shape */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.5, ease: "easeInOut" }}
               className="absolute top-12 bottom-12 right-0 w-[90%] bg-[#8EACB6]/80 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] z-0" 
            />
            
            <motion.div
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, ease: "circOut", delay: 0.2 }}
               className="relative z-10 w-full h-full flex items-end justify-center drop-shadow-2xl"
            >
               <Image 
                 src="/images/doctor_appointment.png" 
                 alt="Doctor Appointment" 
                 width={600}
                 height={800}
                 className="object-contain object-bottom h-[110%] w-auto"
                 priority
               />
            </motion.div>

            {/* Doctors Online Badge */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.8 }}
               className="absolute top-24 right-4 bg-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 z-20"
            >
               <div className="w-3 h-3 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
               <span className="text-sm font-bold text-[#2C3639]">2500+ Doctors Online</span>
            </motion.div>

            {/* Search Floating Card */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 1 }}
               className="absolute bottom-32 -left-12 bg-white p-4 pr-12 rounded-2xl shadow-2xl flex items-center gap-4 z-20"
            >
               <div className="w-14 h-14 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white">
                 <Search size={24} />
               </div>
               <div>
                 <p className="font-bold text-[#2C3639] text-base">Search the Medical</p>
                 <p className="text-xs text-sage/70 font-medium">With more Care Option</p>
               </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Statistics row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 bg-white/40 backdrop-blur-md rounded-t-[3rem] px-12"
        >
          <div className="flex flex-col border-r border-[#2C3639]/10 last:border-r-0">
            <span className="text-4xl font-bold text-[#2C3639]">4500+</span>
            <span className="text-sm font-bold text-sage/60 mt-1">Happy Patients</span>
          </div>
          <div className="flex flex-col border-r border-[#2C3639]/10 last:border-r-0 pl-4">
            <span className="text-4xl font-bold text-[#2C3639]">200</span>
            <span className="text-sm font-bold text-sage/60 mt-1">Hospital Room</span>
          </div>
          <div className="flex flex-col border-r border-[#2C3639]/10 last:border-r-0 pl-4">
            <span className="text-4xl font-bold text-[#2C3639]">500+</span>
            <span className="text-sm font-bold text-sage/60 mt-1">Award Win</span>
          </div>
          <div className="flex flex-col pl-4">
            <span className="text-4xl font-bold text-[#2C3639]">20+</span>
            <span className="text-sm font-bold text-sage/60 mt-1">Ambulance</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
