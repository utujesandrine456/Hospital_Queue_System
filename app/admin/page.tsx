'use client'

import { useEffect, useState } from 'react'
import { useQueueStore } from '@/store/queueStore'
import { useServiceStore } from '@/store/serviceStore'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { formatTime, cn } from '@/lib/utils'
import type { QueueTicket, ServiceType, ServiceInfo } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Clock, Activity, CheckCircle2,
  Stethoscope, FlaskConical, Pill, Microscope,
  Search, User, ShieldCheck, Zap, Hash, Plus, Settings, Sparkles, X, Trash2, Pencil,
  Smile, Syringe, HeartPulse, Baby, Cross, Bone, Eye
} from 'lucide-react'

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

type TabType = 'commander' | 'patients' | 'services'

export default function AdminPage() {
  const { allTickets, advanceQueue, loadFromStorage, setTicketStatus } = useQueueStore()
  const { services, loadServices, addService, deleteService, updateService } = useServiceStore()
  const [activeTab, setActiveTab] = useState<TabType>('commander')
  const [activeServiceFilter, setActiveServiceFilter] = useState<ServiceType>('consultation')

  useNetworkStatus()

  useEffect(() => {
    loadFromStorage()
    loadServices()
  }, [loadFromStorage, loadServices])

  const totalStats = {
    total: allTickets.length,
    waiting: allTickets.filter(t => t.status === 'waiting').length,
    serving: allTickets.filter(t => t.status === 'serving').length,
    completed: allTickets.filter(t => t.status === 'completed').length,
  }

  const handleManualAdvance = async () => {
    advanceQueue(activeServiceFilter)
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

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-12 md:mt-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl md:text-5xl font-black text-[#2C3639] tracking-tight">System Control</h1>
          </motion.div>
        </div>

        {/* Global Nav */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b-2 border-sage/10">
          {[
            { id: 'commander', label: 'Queue Commander', icon: Zap },
            { id: 'patients', label: 'Patient Directory', icon: Users },
            { id: 'services', label: 'Manage Services', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-t-2xl transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? 'bg-sage text-cream'
                  : 'bg-transparent text-sage/60 hover:bg-sage/5 hover:text-sage'
              )}
            >
              <tab.icon size={16} strokeWidth={3} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'commander' && (
              <CommanderTab
                services={services}
                allTickets={allTickets}
                totalStats={totalStats}
                activeService={activeServiceFilter}
                setActiveService={setActiveServiceFilter}
                onAdvance={handleManualAdvance}
              />
            )}
            {activeTab === 'patients' && (
              <PatientsTab
                allTickets={allTickets}
                setTicketStatus={setTicketStatus}
                services={services}
              />
            )}
            {activeTab === 'services' && (
              <ServicesTab
                services={services}
                addService={addService}
                updateService={updateService}
                deleteService={deleteService}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </main>
  )
}


function CommanderTab({ services, allTickets, totalStats, activeService, setActiveService, onAdvance }: any) {
  const tabTickets = allTickets
    .filter((t: QueueTicket) => t.serviceType === activeService)
    .sort((a: QueueTicket, b: QueueTicket) => a.position - b.position || a.createdAt - b.createdAt)

  return (
    <div>
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
            className={cn('rounded-2xl p-6 border border-white/50 relative overflow-hidden group shadow-xl shadow-sage/5 backdrop-blur-md', stat.bg)}
          >
            <stat.icon size={24} strokeWidth={1} className="absolute bottom-2 right-2 text-sage/60 group-hover:text-sage transition-colors" />
            <p className={cn('text-3xl font-bold', stat.color)}>{stat.value}</p>
            <p className="text-xs sm:text-sm font-semibold text-sage/70 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none flex-1">
          {services.map((service: ServiceInfo) => {
            const Icon = getIconForService(service)
            const count = allTickets.filter((t: QueueTicket) => t.serviceType === service.type && t.status !== 'completed').length
            return (
              <button
                key={service.type}
                onClick={() => setActiveService(service.type)}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] md:text-sm font-bold transition-all border-2 whitespace-nowrap',
                  activeService === service.type
                    ? 'bg-sage text-cream border-sage shadow-xl shadow-sage/20'
                    : 'bg-white/40 text-sage/60 border-sage/10 hover:border-sage/30 hover:text-sage'
                )}
              >
                <Icon size={14} strokeWidth={3} />
                <span>{service.label}</span>
                {count > 0 && (
                  <span className={cn(
                    'w-6 h-6 rounded-md flex items-center justify-center font-black transition-colors text-xs',
                    activeService === service.type ? 'bg-cream text-sage' : 'bg-sage/10 text-sage'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <button
          onClick={onAdvance}
          className="hidden md:flex shrink-0 items-center justify-center gap-2 px-6 py-3 bg-[#2C3639] text-cream hover:bg-sage rounded-2xl font-bold shadow-lg transition-colors"
        >
          <Zap size={16} fill="currentColor" />
          Advance Patient
        </button>
      </div>

      <motion.div layout className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-4xl overflow-hidden shadow-2xl shadow-sage/10 mb-12">
        {tabTickets.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-sage/30 gap-4">
            <Search size={48} strokeWidth={1} />
            <p className="font-bold">No active sessions found for this service</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-sage/10 text-left bg-sage/5">
                  <th className="px-6 sm:px-8 py-5 text-xs font-semibold text-sage/60">Entry</th>
                  <th className="px-6 sm:px-8 py-5 text-xs font-semibold text-sage/60">Ticket</th>
                  <th className="px-6 sm:px-8 py-5 text-xs font-semibold text-sage/60">Patient Details</th>
                  <th className="px-6 sm:px-8 py-5 text-xs font-semibold text-sage/60">Status</th>
                  <th className="px-6 sm:px-8 py-5 text-xs font-semibold text-sage/60 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/5">
                <AnimatePresence mode='popLayout'>
                  {tabTickets.map((ticket: QueueTicket) => (
                    <AdminTicketRow key={ticket.id} ticket={ticket} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function AdminTicketRow({ ticket }: { ticket: QueueTicket }) {
  const statusConfig = {
    waiting: { label: 'Waiting', icon: Clock, cls: 'bg-sage/5 text-sage border border-sage/10' },
    serving: { label: 'Serving', icon: Activity, cls: 'bg-sage text-cream shadow-lg shadow-sage/15 animate-pulse' },
    completed: { label: 'Discharged', icon: CheckCircle2, cls: 'bg-sage/5 text-sage/30' },
    cancelled: { label: 'Cancelled', icon: Hash, cls: 'bg-red-50 text-red-600 border border-red-100' },
  }
  const { label, icon: StatusIcon, cls } = statusConfig[ticket.status] || statusConfig.waiting

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={cn(
        'group transition-colors duration-300',
        ticket.status === 'completed' || ticket.status === 'cancelled' ? 'opacity-40 grayscale hover:opacity-60' : 'hover:bg-white'
      )}
    >
      <td className="px-6 sm:px-8 py-5">
        <span className="text-sage/40 text-sm font-black text-center inline-block w-8">
          {ticket.status === 'completed' || ticket.status === 'cancelled' ? '—' : `#${ticket.position}`}
        </span>
      </td>
      <td className="px-6 sm:px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage/5 flex items-center justify-center text-sage group-hover:bg-sage/10 transition-colors">
            <Hash size={16} strokeWidth={3} />
          </div>
          <span className="font-bold text-[#2C3639] tracking-tight">{ticket.ticketNumber}</span>
        </div>
      </td>
      <td className="px-6 sm:px-8 py-5">
        <div className="flex items-center gap-3 text-[#2C3639]">
          <User size={14} className="text-sage/30 md:hidden lg:block" />
          <span className="font-bold">{ticket.patientName}</span>
        </div>
      </td>
      <td className="px-6 sm:px-8 py-5">
        <span className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold capitalize', cls)}>
          <StatusIcon size={12} strokeWidth={3} />
          {label}
        </span>
      </td>
      <td className="px-6 sm:px-8 py-5 text-right">
        <div className="flex flex-col items-end">
          <span className="text-sage/70 font-bold text-[11px]">{formatTime(ticket.createdAt)}</span>
        </div>
      </td>
    </motion.tr>
  )
}

// ----------------------------------------------------
// PATIENTS TAB
// ----------------------------------------------------
function PatientsTab({ allTickets, setTicketStatus, services }: any) {
  const [search, setSearch] = useState('')
  const filtered = allTickets.filter((t: QueueTicket) =>
    t.patientName.toLowerCase().includes(search.toLowerCase()) ||
    t.ticketNumber.toLowerCase().includes(search.toLowerCase())
  ).sort((a: QueueTicket, b: QueueTicket) => b.createdAt - a.createdAt)

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-4xl p-6 shadow-2xl shadow-sage/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-[#2C3639]">Patient Records</h2>
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/40" />
          <input
            type="text"
            placeholder="Search patients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-sage/10 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold outline-none focus:border-sage transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-sage/10 text-left bg-sage/5">
              <th className="px-6 py-4 text-xs font-semibold text-sage/60">Date/Time</th>
              <th className="px-6 py-4 text-xs font-semibold text-sage/60">Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-sage/60">Service</th>
              <th className="px-6 py-4 text-xs font-semibold text-sage/60">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-sage/60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage/5">
            {filtered.slice(0, 50).map((ticket: QueueTicket) => {
              const svc = services.find((s: any) => s.type === ticket.serviceType)
              const serviceName = svc ? svc.label : ticket.serviceType
              return (
                <tr key={ticket.id} className="hover:bg-white group">
                  <td className="px-6 py-4 text-xs font-semibold text-sage/60">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#2C3639]">{ticket.patientName}</div>
                    <div className="text-[10px] font-bold text-sage/40">{ticket.ticketNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#2C3639]/70 capitalize">
                    {serviceName}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-sage my-auto capitalize">
                    {ticket.status}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {ticket.status !== 'completed' && ticket.status !== 'cancelled' && (
                      <button
                        onClick={() => setTicketStatus(ticket.id, 'cancelled')}
                        className="flex items-center gap-1 ml-auto text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                      >
                        <X size={12} strokeWidth={3} /> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length > 50 && (
          <p className="text-center text-sm font-medium text-sage/50 mt-6 pb-2">Showing first 50 results</p>
        )}
        {filtered.length === 0 && (
          <p className="text-center py-12 text-sage/40 font-bold">No patients found matches your criteria.</p>
        )}
      </div>
    </div>
  )
}

// ----------------------------------------------------
// SERVICES TAB
// ----------------------------------------------------
function ServicesTab({ services, addService, updateService, deleteService }: any) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingType, setEditingType] = useState<string | null>(null)

  const [newLabel, setNewLabel] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newWait, setNewWait] = useState(5)

  const openAdd = () => {
    setEditingType(null)
    setNewLabel('')
    setNewDesc('')
    setNewWait(5)
    setIsFormOpen(true)
  }

  const openEdit = (svc: any) => {
    setEditingType(svc.type)
    setNewLabel(svc.label)
    setNewDesc(svc.description)
    setNewWait(svc.avgServiceMinutes)
    setIsFormOpen(true)
  }

  const handleSave = () => {
    if (!newLabel.trim()) return
    if (editingType) {
      updateService(editingType, {
        label: newLabel,
        description: newDesc,
        avgServiceMinutes: Number(newWait)
      })
    } else {
      addService({
        label: newLabel,
        description: newDesc,
        avgServiceMinutes: Number(newWait),
        color: 'sage',
        icon: ''
      })
    }
    setIsFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2C3639]">Service Configurator</h2>
        <button
          onClick={() => isFormOpen ? setIsFormOpen(false) : openAdd()}
          className="flex items-center gap-2 px-5 py-2.5 bg-sage text-cream rounded-xl font-bold text-sm shadow-xl shadow-sage/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />}
          {isFormOpen ? 'Cancel' : 'New Service'}
        </button>
        <button
          onClick={() => {
            if (confirm('Are you absolutely sure? This will delete ALL patients, tickets, and your custom service configurations.')) {
              window.indexedDB.deleteDatabase('medi-queue-db');
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
        >
          <Trash2 size={16} />
          Reset System
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/50 shadow-2xl shadow-sage/10 mb-8 max-w-2xl mt-4">
              <h3 className="text-lg font-bold text-[#2C3639] mb-6">
                {editingType ? 'Update Department' : 'Create New Department'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-sage/80 w-full mb-2">Service Name</label>
                  <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-sage/20 bg-cream/50 outline-none focus:border-sage font-bold shadow-inner" placeholder="e.g. Dentistry" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-sage/80 w-full mb-2">Description</label>
                  <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-sage/20 bg-cream/50 outline-none focus:border-sage font-semibold text-sm shadow-inner" placeholder="Brief explanation of service" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-sage/80 w-full mb-2">Average Wait (Minutes per patient)</label>
                  <input type="number" min="1" value={newWait} onChange={e => setNewWait(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-sage/20 bg-cream/50 outline-none focus:border-sage font-bold shadow-inner" />
                </div>
                <button onClick={handleSave} className="w-full mt-4 py-4 rounded-xl bg-[#2C3639] text-cream font-bold hover:bg-sage transition-colors">
                  {editingType ? 'Save Changes' : 'Save Department'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service: ServiceInfo) => {
          const Icon = getIconForService(service)
          const isCore = ['consultation', 'laboratory', 'pharmacy', 'radiology'].includes(service.type)

          return (
            <div key={service.type} className="bg-white/70 backdrop-blur-xl p-6 rounded-4xl border border-white/50 relative group hover:shadow-xl hover:shadow-sage/10 transition-all shadow-md mt-4">
              <div className="w-12 h-12 rounded-xl bg-sage/10 text-sage flex items-center justify-center mb-6">
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#2C3639] mb-2">{service.label}</h3>
              <p className="text-sm font-medium text-sage/60 mb-6">{service.description}</p>

              <div className="flex items-center gap-2 text-xs font-bold text-[#2C3639]/50 bg-cream max-w-max px-3 py-1.5 rounded-lg border border-sage/5">
                <Clock size={14} className="text-sage" />
                ~{service.avgServiceMinutes} min/patient
              </div>

              <div className="absolute top-6 right-6 flex items-center gap-2">
                <button
                  onClick={() => openEdit(service)}
                  className="p-2 rounded-[10px] bg-white/60 text-sage hover:bg-sage hover:text-white transition-all shadow-sm border border-sage/10"
                  title="Edit Configuration"
                >
                  <Pencil size={16} strokeWidth={2.5} />
                </button>
                {!isCore && (
                  <button
                    onClick={() => deleteService(service.type)}
                    className="p-2 rounded-[10px] bg-red-50/80 text-red-500 transition-all hover:bg-red-500 hover:text-white shadow-sm border border-red-500/10"
                    title="Delete Service"
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}