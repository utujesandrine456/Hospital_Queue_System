import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api/auth'

const TOKEN_KEY = 'mediqueue_admin_token'

interface AuthStoreState {
  token: string | null
  isLoggingIn: boolean
  loginError: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  getToken: () => string | null
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      token: null,
      isLoggingIn: false,
      loginError: null,

      getToken: () => get().token,

      login: async (username, password) => {
        set({ isLoggingIn: true, loginError: null })
        try {
          const { access_token } = await authApi.login(username, password)
          set({ token: access_token, isLoggingIn: false })
          return true
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed'
          set({ loginError: message, isLoggingIn: false })
          return false
        }
      },

      logout: async () => {
        const currentToken = get().token;
        if (currentToken) {
          try {
            await authApi.logout(currentToken);
          } catch (e) {
            console.warn('[Store] API Logout failed', e);
          }
        }
        set({ token: null, loginError: null })
      },
    }),
    {
      name: TOKEN_KEY,
      partialize: state => ({ token: state.token }),
    },
  ),
)
