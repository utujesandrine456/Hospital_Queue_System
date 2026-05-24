'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { ShieldCheck, Loader2 } from 'lucide-react'

export function AdminLogin() {
  const { login, isLoggingIn, loginError } = useAuthStore()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(username, password)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 rounded-4xl p-8 shadow-2xl shadow-sage/10 space-y-6"
      >
        <div className="flex items-center gap-3 text-[#2C3639]">
          <ShieldCheck className="text-sage" size={28} />
          <div>
            <h2 className="text-xl font-bold">Staff Sign In</h2>
            <p className="text-sm text-sage/60">Connect to the hospital queue server</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-sage/80 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sage/20 bg-cream/50 outline-none focus:border-sage font-bold"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-sage/80 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sage/20 bg-cream/50 outline-none focus:border-sage font-bold"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        {loginError && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
            {loginError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-4 rounded-xl bg-sage text-cream font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoggingIn ? <Loader2 size={18} className="animate-spin" /> : null}
          Sign in
        </button>

        <p className="text-xs text-sage/50 text-center">
          Default credentials: admin / admin123 (configure on server)
        </p>
      </form>
    </div>
  )
}
