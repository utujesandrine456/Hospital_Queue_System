'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueueStore } from '@/store/queueStore'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useQueueSimulator } from '@/hooks/useQueueSimulator'
import { getTicket } from '@/lib/db/idb'
import { TicketCard } from '@/components/queue/TicketCard'
import { QueueStatus } from '@/components/queue/QueueStatus'
import { WaitingList } from '@/components/queue/WaitingList'
import { ArrowLeft, Ticket } from 'lucide-react'
import type { QueueTicket } from '@/types'
import Image from 'next/image'
import { FullScreenLoader } from '@/components/ui/Loader'
import { useLanguage } from '@/context/LanguageContext'
import { toast } from 'sonner'

interface PublicTicketViewProps {
    ticketId: string
    onBack?: () => void
}

export function PublicTicketView({ ticketId, onBack }: PublicTicketViewProps) {
    const router = useRouter()
    const { t } = useLanguage()
    const { allTickets, myTicket, loadFromStorage } = useQueueStore()
    const [ticket, setTicket] = useState<QueueTicket | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const prevPosition = useRef<number | null>(null)
    const prevStatus = useRef<string | null>(null)

    useNetworkStatus()
    useQueueSimulator(ticket?.serviceType ?? null)

    useEffect(() => {
        const loadTicket = async () => {
            setIsLoading(true)
            try {
                await loadFromStorage()
                const fromStore = (allTickets.find(t => t.id === ticketId) || (myTicket?.id === ticketId ? myTicket : null))

                if (fromStore) {
                    setTicket(fromStore)
                    prevPosition.current = fromStore.position
                } else {
                    const fromDB = await getTicket(ticketId)
                    if (fromDB) {
                        setTicket(fromDB)
                        prevPosition.current = fromDB.position
                    }
                }
            } catch (err) {
                console.error('[PublicTicketView] Load error:', err)
            } finally {
                setIsLoading(false)
            }
        }
        loadTicket()
    }, [ticketId, loadFromStorage])

    useEffect(() => {
        const updated = allTickets.find(t => t.id === ticketId)
        const freshTicket = updated || (myTicket?.id === ticketId ? myTicket : null)

        if (freshTicket) {
            const positionChanged = prevPosition.current !== null && freshTicket.position < prevPosition.current && freshTicket.position > 0
            const statusChanged = prevStatus.current !== null && freshTicket.status !== prevStatus.current

            if (positionChanged || statusChanged) {
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                    navigator.vibrate([100, 50, 100])
                }

                if (freshTicket.status === 'serving' && (statusChanged || freshTicket.position === 1)) {
                    toast.success(t('nowServing') || "It is your turn! Please proceed.", { position: 'top-center', duration: 10000 })
                } else if (positionChanged) {
                    toast.info(t('positionUpdated') || `Position updated: #${freshTicket.position}`, { position: 'top-center' })
                }
            }
            prevPosition.current = freshTicket.position
            prevStatus.current = freshTicket.status
            setTicket(freshTicket)
        }
    }, [allTickets, myTicket, ticketId, t])

    const fullQueue = ticket
        ? allTickets.filter(t => t.serviceType === ticket.serviceType && t.status !== 'completed')
        : []

    if (isLoading) return <FullScreenLoader text={t('validatingTicket')} />

    if (!ticket) {
        return (
            <main className="min-h-screen bg-cream flex items-center justify-center p-4">
                <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold">{t('ticketNotFound')}</h2>
                    <button onClick={() => onBack ? onBack() : router.push('/')} className="text-sage font-bold">
                        {t('backToHome')}
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="relative min-h-screen bg-[#F3EFE3] flex flex-col lg:flex-row overflow-hidden">
            <div className="relative w-full lg:w-1/2 lg:h-screen border-r border-sage/10 z-10 flex flex-col backdrop-blur-md bg-white/20">
                <div className="max-w-xl mx-auto w-full px-6 py-10 flex-1 flex flex-col justify-center">
                    <button
                        onClick={() => onBack ? onBack() : router.push('/')}
                        className="cursor-pointer flex items-center gap-2 text-sage/50 hover:text-sage text-sm font-bold mb-10 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        {t('backToServices')}
                    </button>
                    <TicketCard ticket={ticket} />
                </div>
            </div>

            <div className="flex-1 h-full lg:overflow-y-auto z-10 p-6 lg:p-12">
                <div className="max-w-2xl mx-auto">
                    {fullQueue.length > 0 ? (
                        <div className="space-y-10">
                            <QueueStatus ticket={ticket} totalInQueue={fullQueue.length} />
                            <WaitingList tickets={fullQueue} currentUserTicketId={ticket.id} />
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="mb-10 w-48 h-48 mx-auto relative">
                                <Image src="/images/queue-empty.png" alt="Empty" fill className="object-contain" />
                            </div>
                            <h3 className="text-2xl font-bold">{t('queueEmpty')}</h3>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
