'use client'

import { SERVICE_CONFIG } from '@/lib/queue/engine'
import type { ServiceInfo } from '@/types'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueueStore } from '@/store/queueStore'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Loader2,
  ArrowRight,
  Sparkles,
  Stethoscope,
  FlaskConical,
  Pill,
  Microscope,
  Ticket,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'

const ICON_MAP = {
  consultation: Stethoscope,
  laboratory: FlaskConical,
  pharmacy: Pill,
  radiology: Microscope,
}

export function ServiceSelector() {
  const router = useRouter()
  const { createTicket, myTicket } = useQueueStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [patientName, setPatientName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const hasActiveTicket =
    myTicket &&
    myTicket.status !== 'completed' &&
    selectedId &&
    myTicket.serviceType === selectedId

  const handleServiceSelect = (category: ServiceInfo) => {
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
          How can we <span className="text-sage italic">Help you today?</span>
        </h2>
        <p className="text-md text-sage/60 font-medium max-w-2xl mx-auto italic">
          Select a clinical department to join the priority queue.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Object.values(SERVICE_CONFIG).map((category, index) => {
          const Icon = ICON_MAP[category.type as keyof typeof ICON_MAP] || Sparkles
          const isSelected = selectedId === category.type

          // Does the user already hold an active ticket for THIS specific card?
          const cardHasActiveTicket =
            myTicket &&
            myTicket.status !== 'completed' &&
            myTicket.serviceType === category.type

          return (
            <motion.div
              key={category.type}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleServiceSelect(category)}
              className={cn(
                'group relative p-10 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden',
                isSelected
                  ? 'bg-sage border-sage shadow-2xl shadow-sage/30 scale-[1.02]'
                  : 'bg-white border-sage/5 hover:border-sage/20 hover:shadow-2xl hover:shadow-sage/10'
              )}
            >
              <div
                className={cn(
                  'absolute -top-12 -right-12 w-40 h-40 rounded-full transition-all duration-700',
                  isSelected ? 'bg-white/10' : 'bg-sage/10 group-hover:bg-sage/15'
                )}
              />

              {/* Active ticket badge on the card */}
              {cardHasActiveTicket && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-cream border border-sage/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                  <span className="text-[10px] font-bold text-sage uppercase tracking-widest">Active</span>
                </div>
              )}

              <div className="relative z-10 space-y-8">
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500',
                    isSelected ? 'bg-white/20 text-cream' : 'bg-sage/10 text-sage group-hover:scale-110'
                  )}
                >
                  <Icon size={32} strokeWidth={2} />
                </div>

                <div className="space-y-3">
                  <h3
                    className={cn(
                      'text-2xl font-bold transition-colors duration-500',
                      isSelected ? 'text-cream' : 'text-[#2C3639]'
                    )}
                  >
                    {category.label}
                  </h3>
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors duration-500 leading-relaxed',
                      isSelected ? 'text-cream/70' : 'text-sage/60'
                    )}
                  >
                    {category.description}
                  </p>
                </div>

                <div
                  className={cn(
                    'flex items-center gap-2 text-xs font-bold italic transition-all duration-500',
                    isSelected
                      ? 'text-cream'
                      : 'text-sage opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                  )}
                >
                  {isSelected ? 'Department Selected' : 'Select Department'}
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedId && (
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto pt-8"
          >
            {hasActiveTicket ? (
              /* ─── Active ticket notice ─── */
              <div className="bg-white rounded-4xl border-2 border-sage/20 shadow-2xl shadow-sage/5 overflow-hidden">
                {/* Header strip */}
                <div className="bg-sage px-8 py-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Ticket size={20} className="text-cream" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-cream/70 uppercase tracking-widest">You have an active ticket</p>
                    <p className="text-base font-bold text-cream">
                      {SERVICE_CONFIG[selectedId as keyof typeof SERVICE_CONFIG]?.label}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6 space-y-5">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-cream border border-sage/10">
                    <AlertCircle size={18} className="text-sage shrink-0 mt-0.5" />
                    <p className="text-sm text-[#2C3639]/70 font-medium leading-relaxed">
                      You already have an active ticket{' '}
                      <span className="font-bold text-[#2C3639]">#{myTicket!.id.slice(-6).toUpperCase()}</span>{' '}
                      in this department. You cannot open a new one while your current ticket is still active.
                    </p>
                  </div>

                  {/* Ticket meta */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-cream/60 border border-sage/10 text-center">
                      <p className="text-xs text-sage/50 font-semibold uppercase tracking-wider mb-1">Position</p>
                      <p className="text-2xl font-bold text-[#2C3639]">#{myTicket!.position}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cream/60 border border-sage/10 text-center">
                      <p className="text-xs text-sage/50 font-semibold uppercase tracking-wider mb-1">Status</p>
                      <p className="text-sm font-bold text-sage capitalize">{myTicket!.status}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/queue/${myTicket!.id}`)}
                    className="cursor-pointer w-full group flex items-center justify-center gap-3 px-8 py-4 bg-[#2C3639] text-cream rounded-xl font-bold text-base transition-all hover:bg-sage active:scale-[0.98] shadow-xl"
                  >
                    <ExternalLink size={18} className="group-hover:scale-110 transition-transform" />
                    View My Ticket
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (

              <div className="bg-white p-6 sm:p-8 rounded-4xl border border-sage/10 shadow-2xl shadow-sage/5 space-y-6">
                <div className="space-y-3">
                  <label htmlFor="patientName" className="block text-sm font-bold text-[#2C3639]">
                    Patient Full Name
                  </label>
                  <input
                    id="patientName"
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGenerateTicket()}
                    placeholder="e.g. John Doe"
                    className="w-full px-5 py-4  rounded-lg bg-[#ffffff] text-[#2C3639] border border-sage/60 focus:border-sage focus:ring-4 focus:ring-sage/10 outline-none transition-all font-medium placeholder:text-sage/40"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleGenerateTicket}
                  disabled={isGenerating || !patientName.trim()}
                  className={cn(
                    'cursor-pointer w-full group relative px-8 py-4 bg-sage text-cream rounded-lg font-bold text-lg transition-all shadow-xl hover:bg-sage active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none'
                  )}
                >
                  <div className="cursor-pointer flex items-center justify-center gap-3">
                    {isGenerating ? (
                      <>
                        <div className="cursor-pointer flex items-center gap-2">
                          <Loader2 className="animate-spin" size={24} />
                          <span>Preparing Care...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="cursor-pointer flex items-center gap-2">
                          <span>Generate Ticket</span>
                          <ArrowRight className="cursor-pointer group-hover:translate-x-1 transition-transform" size={20} />
                        </div>
                      </>
                    )}
                  </div>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}