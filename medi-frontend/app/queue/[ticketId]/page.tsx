'use client'

import { useParams } from 'next/navigation'
import { PublicTicketView } from '@/components/queue/PublicTicketView'

export default function QueuePage() {
  const params = useParams()
  const ticketId = params.ticketId as string

  return <PublicTicketView ticketId={ticketId} />
}