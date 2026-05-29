'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLanguage } from '@/context/LanguageContext'




export function StaffLoginPage({
  redirectTo = '/admin',
}: {
  redirectTo?: string
}) {
  const router = useRouter()
  const { t } = useLanguage()
  const { login, isLoggingIn, loginError, token } = useAuthStore()

  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (token) {
      router.replace(redirectTo)
    }
  }, [token, router, redirectTo])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const ok = await login(username.trim(), password)

    if (ok) {
      localStorage.removeItem('mediqueue_staff_username')

      router.replace(redirectTo)
    }
  }



  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-cream">
      {/* LEFT SIDE */}
      <div className="relative flex flex-col items-center justify-center px-8 py-14 lg:py-0 lg:w-[44%] lg:min-h-screen z-10">
        <div
          className={`relative text-center max-w-sm transition-all duration-600 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
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
            Hospital queue management for staff — secure access to live
            queues and system control.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-10 text-sm font-bold text-sage hover:text-[#2C3639] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home Page
          </Link>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center lg:min-h-screen">
        <div
          className="absolute inset-0 bg-[#2C3639] lg:block hidden"
          style={{
            clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)',
          }}
        />

        <div className="absolute bg-[#2C3639] lg:hidden" />

        <div
          className={`relative z-10 w-full max-w-xl px-6 py-12 lg:px-12 lg:pl-20 transition-all duration-550 ease-out ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}
        >
          <h2 className="text-6xl font-bold text-cream mb-6">
            Welcome Back!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }}>
              <input type="text" name="user" tabIndex={-1} defaultValue="" />
              <input type="password" name="pass" tabIndex={-1} defaultValue="" />
            </div>

            <div>
              <label className="block text-cream/70 text-xs font-bold mb-2 tracking-widest">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="nope"
                name="staff_user_id"
                required
                className="w-full px-4 py-3.5 rounded-xl bg-white/10 text-cream text-sm placeholder:text-cream/30 font-medium outline-none focus:ring-2 focus:ring-sage border border-white/15 focus:border-sage transition-all"
              />
            </div>

            <div>
              <label className="block text-cream/70 text-xs font-bold mb-2 tracking-widest">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="new-password"
                name="staff_pass_key"
                required
                className="w-full px-4 py-3.5 rounded-xl bg-white/10 text-cream text-sm placeholder:text-cream/30 font-medium outline-none focus:ring-2 focus:ring-sage border border-white/15 focus:border-sage transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-1">
              <button
                type="button"
                className="cursor-pointer text-sm font-semibold text-sage/90 hover:text-cream transition-colors"
                onClick={() =>
                  alert(
                    'Contact your hospital IT administrator to reset staff credentials.'
                  )
                }
              >
                Recover password?
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
              {isLoggingIn && (
                <Loader2 size={18} className="animate-spin" />
              )}

              Sign in
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] font-medium text-cream/35">
            Authorized hospital personnel only · Connected to MediQueue
            server
          </p>
        </div>
      </div>
    </div>
  )
}