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
  ChevronRight,
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

          const alreadyBooked = myTickets.some(
            t => t.serviceType === category.type
          )
          const myTicketForService = myTickets.find(t => t.serviceType === category.type)
          const ticketStatus = myTicketForService?.status
          const ticketNumber = myTicketForService?.ticketNumber
          const ticketPosition = myTicketForService?.position

          return (
            <motion.div
              key={category.type}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !alreadyBooked && handleServiceSelect(category)}
              className={cn(
                'group relative p-3 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden',
                alreadyBooked
                  ? ticketStatus === 'serving'
                    ? 'bg-[#2C3639] border-[#2C3639] shadow-2xl shadow-[#2C3639]/40 cursor-default'
                    : ticketStatus === 'done'
                      ? 'bg-sage/5 border-sage/15 cursor-default opacity-60'
                      : 'bg-[#3A4C50] border-sage shadow-xl shadow-sage/25 cursor-default'
                  : isSelected
                    ? 'bg-sage border-sage shadow-2xl shadow-sage/30 scale-[1.02] cursor-pointer'
                    : 'bg-white border-sage/5 hover:border-sage/20 hover:shadow-2xl hover:shadow-sage/10 cursor-pointer',
              )}
            >
              <div
                className={cn(
                  'absolute -top-12 -right-12 w-48 h-48 rounded-full transition-all duration-700',
                  alreadyBooked ? 'bg-white/5' : isSelected ? 'bg-white/10' : 'bg-sage/10 group-hover:bg-sage/15',
                )}
              />

              <div className="relative z-10 p-8 space-y-5">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm shrink-0',
                      isSelected
                        ? 'bg-white/20 text-white'
                        : alreadyBooked
                          ? 'bg-white/15 text-white'
                          : 'bg-sage/10 text-sage group-hover:scale-110',
                    )}
                  >
                    <Icon size={26} strokeWidth={2} />
                  </div>

                  {alreadyBooked && ticketStatus === 'serving' && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-400/20 border border-emerald-400/30 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                      </span>
                      <span className="text-[10px] font-black text-emerald-300 tracking-widest">NOW SERVING</span>
                    </div>
                  )}
                  {alreadyBooked && ticketStatus === 'waiting' && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-300/25 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300" />
                      </span>
                      <span className="text-[10px] font-black text-amber-200 tracking-widest">ACTIVE</span>
                    </div>
                  )}
                  {alreadyBooked && ticketStatus === 'done' && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-sage/10 border border-sage/20 rounded-full">
                      <CheckCircle2 size={10} className="text-sage" />
                      <span className="text-[10px] font-black text-sage tracking-widest">DONE</span>
                    </div>
                  )}
                </div>

                {/* Service name & description */}
                <div className="space-y-1">
                  <h3
                    className={cn(
                      'text-xl font-bold tracking-tight transition-colors duration-500',
                      alreadyBooked && ticketStatus !== 'done'
                        ? 'text-white'
                        : isSelected
                          ? 'text-white'
                          : 'text-[#2C3639]',
                    )}
                  >
                    {t(`${category.type}Title`, category.label)}
                  </h3>
                  <p
                    className={cn(
                      'text-sm leading-relaxed transition-colors duration-500',
                      alreadyBooked && ticketStatus !== 'done'
                        ? 'text-white/55'
                        : isSelected
                          ? 'text-white/75'
                          : 'text-sage/60',
                    )}
                  >
                    {t(`${category.type}Desc`, category.description)}
                  </p>
                </div>

                {/* Ticket chip — shown when booked */}
                {alreadyBooked && ticketNumber && (
                  <div className={cn(
                    'flex items-center justify-between rounded-xl px-4 py-3 border',
                    ticketStatus === 'done'
                      ? 'bg-sage/5 border-sage/10'
                      : 'bg-white/8 border-white/10',
                  )}>
                    <div className="flex items-center gap-2.5">
                      <span className={cn(
                        'text-xs font-black font-mono px-2 py-1 rounded-lg',
                        ticketStatus === 'done'
                          ? 'bg-sage/10 text-sage/70'
                          : 'bg-white/15 text-white',
                      )}>
                        #{ticketNumber}
                      </span>
                      <span className={cn(
                        'text-xs font-semibold',
                        ticketStatus === 'done' ? 'text-sage/50' : 'text-white/55',
                      )}>
                        {ticketStatus === 'serving'
                          ? 'Currently at counter'
                          : ticketStatus === 'done'
                            ? 'Service completed'
                            : `Position #${ticketPosition ?? '—'} in queue`}
                      </span>
                    </div>
                    {ticketStatus !== 'done' && (
                      <ChevronRight size={14} className="text-white/30" strokeWidth={2.5} />
                    )}
                  </div>
                )}

                {/* Hover CTA for available services */}
                {!alreadyBooked && (
                  <div
                    className={cn(
                      'flex items-center gap-2 text-xs font-bold italic transition-all duration-500',
                      isSelected
                        ? 'text-white'
                        : 'text-sage opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0',
                    )}
                  >
                    {isSelected ? t('deptSelected') : t('selectDept')}
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>

              {/* Serving shimmer bar */}
              {alreadyBooked && ticketStatus === 'serving' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                  <div className="h-full w-1/2 bg-emerald-400/50 rounded-full animate-pulse" />
                </div>
              )}
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
                  className="w-full px-5 py-4 rounded-xl bg-white text-[#2C3639] border-2 border-sage/40 shadow-sm focus:border-sage focus:ring-4 focus:ring-sage/15 outline-none transition-all font-bold placeholder:text-sage/40 placeholder:font-medium"
                  autoFocus
                  autoComplete="new-password"
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

      <MyTicketsPanel />
    </div>
  )
}
