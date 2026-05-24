import { apiRequest } from './client'
import type { ApiDepartment, CreateDepartmentPayload } from './types'

export const departmentsApi = {
  list() {
    return apiRequest<ApiDepartment[]>('/departments')
  },

  create(payload: CreateDepartmentPayload, token: string) {
    return apiRequest<ApiDepartment>('/departments', {
      method: 'POST',
      body: payload,
      token,
    })
  },

  update(id: number, payload: Partial<CreateDepartmentPayload>, token: string) {
    return apiRequest<ApiDepartment>(`/departments/${id}`, {
      method: 'PUT',
      body: payload,
      token,
    })
  },

  remove(id: number, token: string) {
    return apiRequest<{ message: string }>(`/departments/${id}`, {
      method: 'DELETE',
      token,
    })
  },
}
