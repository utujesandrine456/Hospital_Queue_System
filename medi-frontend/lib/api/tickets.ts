import { apiRequest } from './client'
import type { ApiTicket, CreateTicketPayload } from './types'

export const ticketsApi = {
  create(payload: CreateTicketPayload) {
    return apiRequest<ApiTicket>('/tickets', { method: 'POST', body: payload })
  },

  getById(id: number) {
    return apiRequest<ApiTicket>(`/tickets/${id}`)
  },

  getAllActive() {
    return apiRequest<ApiTicket[]>('/tickets/active')
  },

  getByPatient(patientId: string) {
    return apiRequest<ApiTicket[]>(`/tickets/patient/${patientId}`)
  },

  chooseServingTicket(patientId: string, ticketId: number) {
    return apiRequest<ApiTicket[]>(
      `/tickets/patient/${patientId}/choose/${ticketId}`,
      { method: 'PUT' },
    )
  },

  getRecentForAdmin(token: string) {
    return apiRequest<ApiTicket[]>('/tickets/admin/recent', { token })
  },

  getQueue(departmentId: number) {
    return apiRequest<ApiTicket[]>(`/tickets/queue/${departmentId}`)
  },

  callNext(departmentId: number, token: string) {
    return apiRequest<ApiTicket | null>(`/tickets/next/${departmentId}`, {
      method: 'PUT',
      token,
    })
  },

  cancel(id: number, token: string) {
    return apiRequest<ApiTicket>(`/tickets/${id}`, { method: 'DELETE', token })
  },
}
