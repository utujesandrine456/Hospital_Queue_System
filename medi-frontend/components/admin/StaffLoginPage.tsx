'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLanguage } from '@/context/LanguageContext'



type StaffRole = 'admin'

const ROLE_COPY = {
  admin: {
    title: 'Administrator',
    subtitle: 'Full system control — departments, queues, and patient records.',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter username',
  },
} as const


export function StaffLoginPage({ redirectTo = '/admin' }: { redirectTo?: string }) {
  const router = useRouter()
  const { t } = useLanguage()
  const { login, isLoggingIn, loginError, token } = useAuthStore()

  const [role, setRole] = useState<StaffRole>('admin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const copy = ROLE_COPY[role]

  useEffect(() => {
    if (token) router.replace(redirectTo)
  }, [token, router, redirectTo])

  useEffect(() => {
    const saved = localStorage.getItem('mediqueue_staff_username')
    if (saved) {
      setUsername(saved)
      setRemember(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(username.trim(), password)
    if (ok) {
      if (remember) {
        localStorage.setItem('mediqueue_staff_username', username.trim())
      } else {
        localStorage.removeItem('mediqueue_staff_username')
      }
      router.replace(redirectTo)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-cream">
      <div className="relative flex flex-col items-center justify-center px-8 py-14 lg:py-0 lg:w-[44%] lg:min-h-screen z-10">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='70' viewBox='0 0 60 70'%3E%3Cpolygon points='30,2 58,17 58,53 30,68 2,53 2,17' fill='none' stroke='%23769382' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundSize: '56px 64px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'circOut' }}
          className="relative text-center max-w-sm"
        >
          <div className="mx-auto mb-8 w-28 h-28 rounded-full bg-white shadow-2xl shadow-sage/25 border-4 border-sage/20 p-1 overflow-hidden">
            <Image
              src="/images/logo-image.png"
              alt="MediQueue"
              width={112}
              height={112}
              className="w-full h-full object-cover rounded-full"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[#2C3639] tracking-tight">
            Medi<span className="text-sage">Queue</span>
          </h1>
          <p className="mt-2 text-lg font-semibold text-sage italic">
            {t('smartHealth')}
          </p>
          <p className="mt-6 text-sm font-medium text-[#2C3639]/55 leading-relaxed">
            Hospital queue management for staff — secure access to live queues and system control.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-10 text-sm font-bold text-sage hover:text-[#2C3639] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home Page
          </Link>
        </motion.div>
      </div>


      <div className="relative flex-1 flex items-center justify-center lg:min-h-screen">
        <div
          className="absolute inset-0 bg-[#2C3639] lg:block hidden"
          style={{ clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)' }}
        />
        <div
          className="absolute inset-0 bg-linear-to-br from-[#2C3639] via-[#3d4f52] to-sage lg:hidden"
        />

        <div
          className="absolute inset-0 opacity-20 pointer-events-none hidden lg:block"
          style={{
            clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)',
            backgroundImage: `radial-gradient(circle at 70% 30%, #769382 0%, transparent 50%)`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="relative z-10 w-full max-w-md px-6 py-12 lg:px-12 lg:pl-20"
        >
          <h2 className="text-6xl font-bold text-cream mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-cream text-sm font-semibold mb-2">
                {copy.usernameLabel}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={copy.usernamePlaceholder}
                autoComplete="username"
                required
                className="w-full px-4 py-4 rounded-lg bg-cream text-sm text-[#2C3639] placeholder:text-[#2C3639]/35 font-semibold outline-none focus:ring-2 focus:ring-sage/80 border border-transparent"
              />
            </div>

            <div>
              <label className="block text-cream text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-4 rounded-lg bg-cream text-sm text-[#2C3639] placeholder:text-[#2C3639]/35 font-semibold outline-none focus:ring-2 focus:ring-sage/80 border border-transparent"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-cream/30 text-sage focus:ring-sage accent-sage"
                />
                <span className="text-sm font-semibold text-cream/80 group-hover:text-cream">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="cursor-pointer text-sm font-semibold text-sage/90 hover:text-cream transition-colors"
                onClick={() =>
                  alert('Contact your hospital IT administrator to reset staff credentials.')
                }
              >
                Recover password
              </button>
            </div>

            {loginError && (
              <p className="text-sm font-semibold text-red-200 bg-red-500/20 border border-red-400/30 px-4 py-3 rounded-lg">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="cursor-pointer w-full py-4 mt-2 rounded-lg bg-sage hover:bg-[#8aa894] text-cream font-semibold text-md shadow-xl shadow-black/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <Loader2 size={18} className="animate-spin" /> : null}
              Sign in
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] font-medium text-cream/35">
            Authorized hospital personnel only · Connected to MediQueue server
          </p>
        </motion.div>
      </div>
    </div>
  )
}
