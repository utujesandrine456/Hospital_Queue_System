'use client'

import { SERVICE_CONFIG } from '@/lib/queue/engine'
import type { ServiceInfo } from '@/types'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQueueStore } from '@/store/queueStore'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Loader2, ArrowRight, Sparkles, Stethoscope, FlaskConical, Pill, Microscope } from 'lucide-react'

const ICON_MAP = {
  consultation: Stethoscope,
  laboratory: FlaskConical,
  pharmacy: Pill,
  radiology: Microscope,
}

export function ServiceSelector() {
  const router = useRouter()
  const { createTicket } = useQueueStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [patientName, setPatientName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleServiceSelect = async (category: ServiceInfo) => {
    setSelectedId(category.type)
  }

  const handleGenerateTicket = async () => {
    if (!selectedId || !patientName.trim()) return

    setIsGenerating(true)
    const category = Object.values(SERVICE_CONFIG).find(c => c.type === selectedId)!
    try {
      const ticket = await createTicket(category.type, patientName.trim())
      if (ticket) {
        router.push(`/queue/${ticket.id}`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-5xl lg:text-6xl font-bold text-[#2C3639] leading-tight">
          How can we <span className='text-sage italic'>Help you today?</span>
        </h2>
        <p className="text-md text-sage/60 font-medium max-w-2xl mx-auto italic">
          Select a clinical department to join the priority queue.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Object.values(SERVICE_CONFIG).map((category, index) => {
          const Icon = ICON_MAP[category.type as keyof typeof ICON_MAP] || Sparkles
          const isSelected = selectedId === category.type

          return (
            <motion.div
              key={category.type}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleServiceSelect(category)}
              className={cn(
                "group relative p-10 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden",
                isSelected
                  ? "bg-sage border-sage shadow-2xl shadow-sage/30 scale-[1.02]"
                  : "bg-white border-sage/5 hover:border-sage/20 hover:shadow-2xl hover:shadow-sage/10"
              )}
            >
              <div className={cn(
                "absolute -top-12 -right-12 w-40 h-40 rounded-full transition-all duration-700",
                isSelected ? "bg-white/10" : "bg-sage/10 group-hover:bg-sage/15"
              )} />

              <div className="relative z-10 space-y-8">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                  isSelected ? "bg-white/20 text-cream" : "bg-sage/10 text-sage group-hover:scale-110"
                )}>
                  <Icon size={32} strokeWidth={2} />
                </div>

                <div className="space-y-3">
                  <h3 className={cn(
                    "text-2xl font-bold transition-colors duration-500",
                    isSelected ? "text-cream" : "text-[#2C3639]"
                  )}>
                    {category.label}
                  </h3>
                  <p className={cn(
                    "text-sm font-medium transition-colors duration-500 leading-relaxed",
                    isSelected ? "text-cream/70" : "text-sage/60"
                  )}>
                    {category.description}
                  </p>
                </div>

                <div className={cn(
                  "flex items-center gap-2 text-xs font-bold italic transition-all duration-500",
                  isSelected ? "text-cream" : "text-sage opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                )}>
                  {isSelected ? "Department Selected" : "Select Department"}
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {selectedId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto pt-8"
        >
          <div className="bg-white p-6 sm:p-8 rounded-4xl border border-sage/10 shadow-2xl shadow-sage/5 space-y-6">
            <div className="space-y-3">
              <label htmlFor="patientName" className="block text-sm font-bold text-[#2C3639]">
                Patient Full Name
              </label>
              <input
                id="patientName"
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-5 py-4 rounded-xl bg-[#ffffff] text-[#2C3639] border border-transparent focus:border-sage focus:ring-4 focus:ring-sage/10 outline-none transition-all font-medium placeholder:text-sage/40"
                autoFocus
              />
            </div>

            <button
              onClick={handleGenerateTicket}
              disabled={isGenerating || !patientName.trim()}
              className={cn(
                "w-full group relative px-8 py-5 bg-[#2C3639] text-cream rounded-xl font-bold text-lg transition-all shadow-xl hover:bg-sage active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none",
              )}
            >
              <div className="cursor-pointer flex items-center justify-center gap-3">
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Preparing Care...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Ticket</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}