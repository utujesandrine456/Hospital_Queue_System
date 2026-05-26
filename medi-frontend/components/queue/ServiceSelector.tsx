'use client'

import { useServiceStore } from '@/store/serviceStore'
import type { ServiceInfo } from '@/types'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueueStore } from '@/store/queueStore'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Loader2,
  ArrowRight,
  Sparkles,
  Stethoscope,
  FlaskConical,
  Pill,
  Microscope,
  CheckCircle2,
  Smile, Syringe, HeartPulse, Baby, Cross, Bone, Eye
} from 'lucide-react'
import { MyTicketsPanel } from './MyTicketsPanel'

const ICON_MAP: Record<string, any> = {
  consultation: Stethoscope,
  laboratory: FlaskConical,
  pharmacy: Pill,
  radiology: Microscope,
}

export function getIconForService(service: any) {
  if (ICON_MAP[service.type]) return ICON_MAP[service.type]
  const lower = (service.label || '').toLowerCase()
  if (lower.includes('dentist') || lower.includes('teeth') || lower.includes('tooth')) return Smile
  if (lower.includes('cardio') || lower.includes('heart')) return HeartPulse
  if (lower.includes('pediatric') || lower.includes('baby') || lower.includes('child')) return Baby
  if (lower.includes('ortho') || lower.includes('bone')) return Bone
  if (lower.includes('eye') || lower.includes('vision') || lower.includes('opt')) return Eye
  if (lower.includes('vaccin') || lower.includes('inject')) return Syringe
  if (lower.includes('emerg') || lower.includes('urgent') || lower.includes('trauma')) return Cross
  return Sparkles
}

export function ServiceSelector() {
  const router = useRouter()
  const { t } = useLanguage()
  const { createTicket, myTickets } = useQueueStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [patientName, setPatientName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { services, loadServices } = useServiceStore()

  useEffect(() => {
    loadServices()
  }, [loadServices])

  // Pre-fill patient name from the first ticket if available
  useEffect(() => {
    if (myTickets.length > 0 && !patientName) {
      const name = myTickets[0]?.patientName
      if (name && name !== 'Anonymous User') setPatientName(name)
    }
  }, [myTickets, patientName])

  const handleServiceSelect = (category: ServiceInfo) => {
    setSelectedId(category.type)
  }

  const handleGenerateTicket = async () => {
    if (!selectedId || !patientName.trim()) return
    setIsGenerating(true)
    try {
      const ticket = await createTicket(selectedId, patientName.trim())
      if (ticket) {
        if (ticket.deferred) {
          toast.success(
            t('deferredTicketCreated') ??
            `Ticket booked! It will activate once your current service is complete.`,
          )
          setSelectedId(null)
        } else {
          toast.success(t('ticketGenerated') ?? 'Ticket generated successfully!')
          router.push(`/queue/${ticket.id}`)
        }
      } else {
        toast.error(t('generateFailed') ?? 'Failed to generate ticket. Please try again.')
      }
    } catch (err) {
      console.error('[ServiceSelector] Generation error:', err)
      toast.error(t('systemError') ?? 'A system error occurred.')
      setTimeout(() => router.refresh(), 1000)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-5xl lg:text-6xl font-bold text-[#2C3639] leading-tight">
          {t('selectServiceTitle')}
        </h2>
        <p className="text-md text-sage/60 font-medium max-w-2xl mx-auto italic">
          {t('selectServiceSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((category, index) => {
          const Icon = getIconForService(category)
          const isSelected = selectedId === category.type

          // Does the patient already have ANY ticket for this service?
          const alreadyBooked = myTickets.some(
            t =>
              t.serviceType === category.type &&
              (t.status === 'waiting' || t.status === 'serving'),
          )

          return (
            <motion.div
              key={category.type}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !alreadyBooked && handleServiceSelect(category)}
              className={cn(
                'group relative p-10 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden',
                alreadyBooked
                  ? 'bg-sage/8 border-sage/20 cursor-default'
                  : isSelected
                    ? 'bg-sage border-sage shadow-2xl shadow-sage/30 scale-[1.02] cursor-pointer'
                    : 'bg-white border-sage/5 hover:border-sage/20 hover:shadow-2xl hover:shadow-sage/10 cursor-pointer',
              )}
            >
              <div
                className={cn(
                  'absolute -top-12 -right-12 w-40 h-40 rounded-full transition-all duration-700',
                  isSelected ? 'bg-white/10' : 'bg-sage/10 group-hover:bg-sage/15',
                )}
              />

              {/* Already-booked badge */}
              {alreadyBooked && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-sage/10 border border-sage/20 rounded-full">
                  <CheckCircle2 size={11} className="text-sage" />
                  <span className="text-[10px] font-bold text-sage">
                    {t('bookedLabel') ?? 'Booked'}
                  </span>
                </div>
              )}

              <div className="relative z-10 space-y-8">
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500',
                    isSelected
                      ? 'bg-white/20 text-cream'
                      : alreadyBooked
                        ? 'bg-sage/10 text-sage/50'
                        : 'bg-sage/10 text-sage group-hover:scale-110',
                  )}
                >
                  <Icon size={32} strokeWidth={2} />
                </div>

                <div className="space-y-3">
                  <h3
                    className={cn(
                      'text-2xl font-bold transition-colors duration-500',
                      isSelected ? 'text-cream' : 'text-[#2C3639]',
                    )}
                  >
                    {t(`${category.type}Title`, category.label)}
                  </h3>
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors duration-500 leading-relaxed',
                      isSelected ? 'text-cream/70' : 'text-sage/60',
                    )}
                  >
                    {t(`${category.type}Desc`, category.description)}
                  </p>
                </div>

                {!alreadyBooked && (
                  <div
                    className={cn(
                      'flex items-center gap-2 text-xs font-bold italic transition-all duration-500',
                      isSelected
                        ? 'text-cream'
                        : 'text-sage opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0',
                    )}
                  >
                    {isSelected ? t('deptSelected') : t('selectDept')}
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Name input + Generate button */}
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
            <div className="bg-white p-6 sm:p-8 rounded-4xl border border-sage/10 shadow-2xl shadow-sage/5 space-y-6">
              <div className="space-y-3">
                <label htmlFor="patientName" className="block text-sm font-bold text-[#2C3639]">
                  {t('patientFullName')}
                </label>
                <input
                  id="patientName"
                  name="patientName"
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerateTicket()}
                  placeholder={t('patientNamePlaceholder')}
                  className="w-full px-5 py-4 rounded-lg bg-white text-[#2C3639] border border-sage/60 focus:border-sage focus:ring-4 focus:ring-sage/10 outline-none transition-all font-medium placeholder:text-sage/40"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  disabled={myTickets.length > 0 && myTickets[0]?.patientName !== 'Anonymous User'}
                />
                {myTickets.length > 0 && (
                  <p className="text-xs text-sage/50 font-medium">
                    {t('sameNameHint') ?? 'Using the same name as your existing tickets'}
                  </p>
                )}
              </div>

              <button
                onClick={handleGenerateTicket}
                disabled={isGenerating || !patientName.trim()}
                className={cn(
                  'cursor-pointer w-full group relative px-8 py-4 bg-sage text-cream rounded-lg font-bold text-lg transition-all shadow-xl hover:bg-sage active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none',
                )}
              >
                <div className="cursor-pointer flex items-center justify-center gap-3">
                  {isGenerating ? (
                    <div className="cursor-pointer flex items-center gap-2">
                      <Loader2 className="animate-spin" size={24} />
                      <span>{t('takingTicketBtn')}</span>
                    </div>
                  ) : (
                    <div className="cursor-pointer flex items-center gap-2">
                      <span>{t('takeTicketTitle')}</span>
                      <ArrowRight className="cursor-pointer group-hover:translate-x-1 transition-transform" size={20} />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-ticket panel */}
      <MyTicketsPanel />
    </div>
  )
}