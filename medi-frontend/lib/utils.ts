import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ServiceType, TicketStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWaitTime(minutes: number): string {
  if (minutes <= 0) return 'Now'
  if (minutes < 60) return `~${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `~${hours}h ${mins}min` : `~${hours}h`
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function getStatusText(status: TicketStatus, position: number): string {
  switch (status) {
    case 'waiting':
      if (position === 1) return `Preparing for you... Please be ready`
      return position === 2
        ? `You are next! Please be ready.`
        : `There are ${position - 1} people ahead of you`
    case 'serving':
      return 'Please proceed — you are being served now'
    case 'completed':
      return 'Your visit is complete. Thank you!'
    case 'cancelled':
      return 'This ticket has been cancelled'
    default:
      return 'Unknown status'
  }
}

export function getStatusColor(status: TicketStatus): string {
  switch (status) {
    case 'waiting': return 'text-sage'
    case 'serving': return 'text-sage'
    case 'completed': return 'text-sage/40'
    case 'cancelled': return 'text-sage/30'
    default: return 'text-sage/40'
  }
}

export function getServiceColor(serviceType: ServiceType): {
  bg: string; border: string; text: string; badge: string
} {
  return {
    bg: 'bg-white/60',
    border: 'border-sage/20',
    text: 'text-[#2C3639]',
    badge: 'bg-sage/10 text-sage',
  }
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}