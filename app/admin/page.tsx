'use client'

import { useEffect, useState } from 'react'
import { useQueueStore } from '@/store/queueStore'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { SERVICE_CONFIG } from '@/lib/queue/engine'
import { formatTime, cn } from '@/lib/utils'
import type { QueueTicket, ServiceType } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Clock,
  Activity,
  CheckCircle2,
  Stethoscope,
  FlaskConical,
  Pill,
  Microscope,
  Search,
  User,
  ShieldCheck,
  Zap,
  Hash,
  ArrowLeft
} from 'lucide-react'

const SERVICES: ServiceType[] = ['consultation', 'laboratory', 'pharmacy', 'radiology']

const ICON_MAP = {
  consultation: Stethoscope,
  laboratory: FlaskConical,
  pharmacy: Pill,
  radiology: Microscope,
}

export default function AdminPage() {
  const { allTickets, advanceQueue, loadFromStorage } = useQueueStore()
  const [activeTab, setActiveTab] = useState<ServiceType>('consultation')
  const [totalStats, setTotalStats] = useState({ total: 0, waiting: 0, serving: 0, completed: 0 })

  useNetworkStatus()

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  useEffect(() => {
    setTotalStats({
      total: allTickets.length,
      waiting: allTickets.filter(t => t.status === 'waiting').length,
      serving: allTickets.filter(t => t.status === 'serving').length,
      completed: allTickets.filter(t => t.status === 'completed').length,
    })
  }, [allTickets])

  const tabTickets = allTickets
    .filter(t => t.serviceType === activeTab)
    .sort((a, b) => a.position - b.position || a.createdAt - b.createdAt)

  const handleManualAdvance = async () => {
    advanceQueue()
    await loadFromStorage()
  }

  return (
    <main className="min-h-screen bg-cream selection:bg-sage/20">
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(var(--primary-sage) 1px, transparent 1px), linear-gradient(90deg, var(--primary-sage) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2 text-sage/40">
              <ShieldCheck size={16} strokeWidth={3} />
              <span className="text-[10px] font-bold">Administrative Portal</span>
            </div>
            <h1 className="text-4xl font-bold text-[#2C3639]">Queue Commander</h1>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleManualAdvance}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-sage hover:bg-sage/90 text-cream rounded-3xl font-bold shadow-2xl shadow-sage/20 transition-all active:scale-95 cursor-pointer"
          >
            <Zap size={20} fill="currentColor" />
            <span>Advance Next Patient</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Visits', value: totalStats.total, icon: Users, color: 'text-[#2C3639]', bg: 'bg-white/60' },
            { label: 'Waiting', value: totalStats.waiting, icon: Clock, color: 'text-sage', bg: 'bg-white/60' },
            { label: 'Now Serving', value: totalStats.serving, icon: Activity, color: 'text-sage', bg: 'bg-sage/5' },
            { label: 'Discharged', value: totalStats.completed, icon: CheckCircle2, color: 'text-sage/40', bg: 'bg-white/40' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn('rounded-4xl p-6 border-2 border-sage/10 relative overflow-hidden group shadow-sm', stat.bg)}
            >
              <stat.icon size={48} strokeWidth={1} className="absolute -bottom-2 -right-2 text-sage/5 group-hover:text-sage/10 transition-colors" />
              <p className={cn('text-3xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-[10px] font-bold text-sage/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-none">
          {SERVICES.map(service => {
            const cfg = SERVICE_CONFIG[service]
            const Icon = ICON_MAP[service]
            const count = allTickets.filter(t => t.serviceType === service && t.status !== 'completed').length
            return (
              <motion.button
                key={service}
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab(service)}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-bold transition-all border-2 cursor-pointer',
                  activeTab === service
                    ? 'bg-sage text-cream border-sage shadow-xl shadow-sage/20'
                    : 'bg-white/40 text-sage/60 border-sage/10 hover:border-sage/30 hover:text-sage'
                )}
              >
                <Icon size={14} strokeWidth={3} />
                <span>{cfg.label}</span>
                {count > 0 && (
                  <span className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center font-bold transition-colors',
                    activeTab === service ? 'bg-cream text-sage' : 'bg-sage/10 text-sage'
                  )}>
                    {count}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        <motion.div
          layout
          className="bg-white/60 border-2 border-sage/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-sage/5"
        >
          {tabTickets.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-sage/30 gap-4">
              <Search size={48} strokeWidth={1} />
              <p className="font-bold">No active sessions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-sage/10 text-left">
                    <th className="px-8 py-6 text-[10px] font-bold text-sage/40">Entry</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-sage/40">Ticket</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-sage/40">Patient Details</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-sage/40">Current Status</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-sage/40 text-right">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/5">
                  <AnimatePresence mode='popLayout'>
                    {tabTickets.map(ticket => (
                      <AdminTicketRow key={ticket.id} ticket={ticket} />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}

function AdminTicketRow({ ticket }: { ticket: QueueTicket }) {
  const statusConfig = {
    waiting: { label: 'Waiting', icon: Clock, cls: 'bg-sage/5 text-sage border border-sage/10' },
    serving: { label: 'Serving', icon: Activity, cls: 'bg-sage text-cream shadow-lg shadow-sage/15 animate-pulse' },
    completed: { label: 'Discharged', icon: CheckCircle2, cls: 'bg-sage/5 text-sage/30' },
    cancelled: { label: 'Cancelled', icon: Hash, cls: 'bg-red-50 text-red-600 border border-red-100' },
  }
  const { label, icon: StatusIcon, cls } = statusConfig[ticket.status]

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        'group transition-colors duration-300 cursor-pointer',
        ticket.status === 'completed' ? 'opacity-40 grayscale' : 'hover:bg-sage/2'
      )}
    >
      <td className="px-8 py-6">
        <span className="text-sage/40 text-[10px] font-bold">
          {ticket.status === 'completed' ? '—' : `#${ticket.position}`}
        </span>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage/5 flex items-center justify-center text-sage group-hover:bg-sage/10 transition-colors">
            <Hash size={16} strokeWidth={3} />
          </div>
          <span className="font-bold text-[#2C3639] text-lg">{ticket.ticketNumber}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-3 text-[#2C3639]">
          <User size={14} className="text-sage/30" />
          <span className="text-sm font-bold">{ticket.patientName}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <span className={cn('inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold', cls)}>
          <StatusIcon size={10} strokeWidth={3} />
          {label}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex flex-col items-end">
          <span className="text-sage/70 font-bold text-[10px]">{formatTime(ticket.createdAt)}</span>
          <span className={cn('text-[8px] font-bold mt-1', ticket.isSimulated ? 'text-sage/20' : 'text-sage/40')}>
            {ticket.isSimulated ? 'Simulation' : 'Verified Channel'}
          </span>
        </div>
      </td>
    </motion.tr>
  )
}