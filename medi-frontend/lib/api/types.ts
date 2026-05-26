export type ApiTicketStatus = 'waiting' | 'serving' | 'done' | 'cancelled'

export interface ApiDepartment {
  id: number
  name: string
  slug: string
  acronym: string
  description?: string | null
  avgServiceMinutes: number
  isActive: boolean
  createdAt: string
}

export interface ApiTicket {
  id: number
  ticketNumber: string
  status: ApiTicketStatus
  patientName?: string | null
  patientPhone?: string | null
  patientId?: string | null
  deferred?: boolean
  position: number
  bookedAt: string
  servingStartedAt?: string | null
  servedAt?: string | null
  department: ApiDepartment
}

export interface CreateTicketPayload {
  departmentId: number
  patientName?: string
  patientPhone?: string
}

export interface CreateDepartmentPayload {
  name: string
  slug: string
  acronym: string
  description?: string
  avgServiceMinutes?: number
}

export interface LoginResponse {
  access_token: string
}
