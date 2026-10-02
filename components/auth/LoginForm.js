'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Loader2, Phone, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { googleAccessToken } from '@/lib/googleSignIn'
import { captureReferral, getReferral, clearReferral } from '@/lib/referral'
import OtpInput from './OtpInput'

const RESEND_SECONDS = 30

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export default function LoginForm({ next }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [digits, setDigits] = useState('')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(null) // 'google' | 'send' | 'verify'
  const [error, setError] = useState('')
  const [resendIn, setResendIn] = useState(0)
  const phoneRef = useRef(null)

  useEffect(() => captureReferral(searchParams), [searchParams])

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const phoneNumber = `+91${digits}`
  const phoneValid = /^[6-9]\d{9}$/.test(digits)

  function finish({ onboarded }) {
    clearReferral()
    router.replace(onboarded ? next : `/onboarding?next=${encodeURIComponent(next)}`)
    router.refresh()
  }

  async function onGoogle() {
    setError('')
    setBusy('google')
    try {
      const google = await googleAccessToken()
      const res = await api('/api/session/google', { method: 'POST', body: { ...google, referredBy: getReferral() } })
      finish(res)
    } catch (e) {
      setError(e.message)
      setBusy(null)
    }
  }

  async function sendCode(e) {
    e?.preventDefault()
    if (!phoneValid) return setError('Enter a valid 10-digit Indian mobile number.')
    setError('')
    setBusy('send')
    try {
      await api('/auth/phone/send-otp', { method: 'POST', body: { phoneNumber } })
      setStep('otp')
      setOtp('')
      setResendIn(RESEND_SECONDS)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  async function verify(code = otp) {
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code.')
    setError('')
    setBusy('verify')
    try {
      const res = await api('/api/session/otp', { method: 'POST', body: { phoneNumber, otp: code, referredBy: getReferral() } })
      finish(res)
    } catch (e) {
      setError(e.status === 401 ? 'That code is not right or has expired. Try again or resend it.' : e.message)
      setBusy(null)
    }
  }

  return (
    <div className="glass mx-auto w-full max-w-md rounded-[2rem] p-6 sm:p-8">
      <h2 className="font-display text-2xl font-black tracking-tight">Sign in or create account</h2>
      <p className="mt-1 text-sm text-ink-2">Same account as the VedifyAstro app.</p>

      <button
        type="button"
        onClick={onGoogle}
        disabled={!!busy}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3.5 font-semibold text-cosmos-950 transition hover:bg-white/90 disabled:opacity-60"
      >
        {busy === 'google' ? <Loader2 size={20} className="animate-spin" /> : <GoogleMark />}
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-ink-3">
        <span className="h-px flex-1 bg-line-2" /> or use your phone <span className="h-px flex-1 bg-line-2" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 'phone' ? (
          <motion.form key="phone" onSubmit={sendCode} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            <label htmlFor="phone" className="text-sm font-semibold text-ink-2">Mobile number</label>
            <div className="mt-2 flex items-center rounded-2xl border border-line-2 bg-white/5 focus-within:border-gold/60">
              <span className="flex items-center gap-2 border-r border-line-2 px-4 py-3.5 text-sm font-semibold text-ink-1">
                <Phone size={15} className="text-gold" /> +91
              </span>
              <input
                ref={phoneRef}
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={digits}
                onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(-10))}
                className="w-full border-0 bg-transparent px-4 py-3.5 text-lg tracking-wider text-ink-1 placeholder:text-ink-3 focus:ring-0"
              />
            </div>
            <button
              type="submit"
              disabled={!!busy || !phoneValid}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad px-5 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110 disabled:opacity-50 disabled:shadow-none"
            >
              {busy === 'send' && <Loader2 size={18} className="animate-spin" />} Send code
            </button>
          </motion.form>
        ) : (
          <motion.div key="otp" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
            <button type="button" onClick={() => { setStep('phone'); setError('') }} className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink-1">
              <ArrowLeft size={15} /> Change number
            </button>
            <p className="mt-3 text-sm text-ink-2">
              Enter the 6-digit code sent to <span className="font-semibold text-ink-1">+91 {digits.slice(0, 5)} {digits.slice(5)}</span>
            </p>
            <OtpInput value={otp} onChange={setOtp} onComplete={verify} disabled={busy === 'verify'} />
            <button
              type="button"
              onClick={() => verify()}
              disabled={!!busy || otp.length !== 6}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad px-5 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110 disabled:opacity-50 disabled:shadow-none"
            >
              {busy === 'verify' ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} Verify & continue
            </button>
            <p className="mt-4 text-center text-sm text-ink-3">
              {resendIn > 0 ? (
                <>Resend code in {resendIn}s</>
              ) : (
                <button type="button" onClick={sendCode} disabled={!!busy} className="font-semibold text-gold-soft hover:underline">Resend code</button>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p role="alert" className="mt-4 rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

      <p className="mt-6 text-center text-xs leading-relaxed text-ink-3">
        By continuing you agree to our <a href="/terms" className="underline hover:text-ink-2">Terms</a> and{' '}
        <a href="/privacy-policy" className="underline hover:text-ink-2">Privacy Policy</a>.
      </p>
    </div>
  )
}
