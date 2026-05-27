import { apiRequest } from './client'
import type { LoginResponse } from './types'

export const authApi = {
  login(username: string, password: string) {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
    })
  },
  logout(token: string) {
    return apiRequest<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      token,
    })
  },
}
