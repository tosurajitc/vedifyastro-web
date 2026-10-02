'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import QRCode from 'qrcode'
import { ArrowLeft, Check, Copy, Gift, Mail, MessageCircle, Share2, TrendingUp, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/cn'

const pts = (n) => Math.floor(Number(n) || 0).toLocaleString('en-IN')
const monthName = (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

// What the backend actually pays (walletController.creditReferralSignupBonus + referralController):
// the referrer gets 100 VA Points when a friend completes their first recharge, plus 10% of the
// friends' spending in any month where it passes ₹2,000.
function shareText(code, link) {
  return `Join me on VedifyAstro — Vedic astrology with AI astrologers who read your own kundli. Sign up with my code ${code}: ${link}`
}

export default function ReferView({ firstName }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [qr, setQr] = useState(null)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    api('/referral/summary').then((r) => setData(r.data)).catch((e) => setError(e.message))
  }, [])

  const code = data?.referralCode
  const link = code ? `${window.location.origin}/login?ref=${code}` : ''

  useEffect(() => {
    if (!link) return
    QRCode.toDataURL(link, { margin: 1, width: 240, color: { dark: '#0d0028', light: '#ffffff' } }).then(setQr).catch(() => {})
  }, [link])

  async function copy(what, text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(null), 1800)
    } catch {}
  }

  async function nativeShare() {
    const text = shareText(code, link)
    if (navigator.share) {
      try { await navigator.share({ title: 'Join VedifyAstro', text }) } catch {}
    } else copy('link', text)
  }

  const month = data?.currentMonth

  return (
    <section className="py-10 sm:py-16">
      <div className="wrap max-w-4xl">
        <Link href="/wallet" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink-1"><ArrowLeft size={15} /> Wallet</Link>

        {/* Hero */}
        <div className="relative mt-4 overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-cosmos-600/60 via-cosmos-800/80 to-cosmos-900 p-6 sm:p-10">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr,auto]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold"><Gift size={12} /> Refer & earn</span>
              <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
                Share the stars, <span className="text-gold-grad">earn VA Points</span>
              </h1>
              <ul className="mt-5 space-y-2 text-ink-1">
                <li className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-gold" /> <span><b>100 VA Points</b> for you when a friend makes their first recharge</span></li>
                <li className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-gold" /> <span><b>10% back</b> on everything your friends spend in a month, once they pass ₹2,000 together</span></li>
              </ul>

              {/* Code */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <div className="rounded-2xl border-2 border-dashed border-gold/60 bg-cosmos-950/40 px-6 py-3 font-display text-3xl font-black tracking-[.25em] text-gold-soft">
                  {code || '······'}
                </div>
                <button type="button" disabled={!code} onClick={() => copy('code', code)} className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10">
                  {copied === 'code' ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />} {copied === 'code' ? 'Copied' : 'Copy code'}
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <a href={code ? `https://wa.me/?text=${encodeURIComponent(shareText(code, link))}` : undefined} target="_blank" rel="noopener noreferrer"
                  className={cn('inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-cosmos-950 transition hover:brightness-110', !code && 'pointer-events-none opacity-50')}>
                  <MessageCircle size={17} /> WhatsApp
                </a>
                <a href={code ? `mailto:?subject=${encodeURIComponent('Join me on VedifyAstro')}&body=${encodeURIComponent(`Hi,\n\n${shareText(code, link)}\n\n— ${firstName}`)}` : undefined}
                  className={cn('inline-flex items-center gap-2 rounded-full border border-line-2 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10', !code && 'pointer-events-none opacity-50')}>
                  <Mail size={17} /> Email
                </a>
                <button type="button" disabled={!code} onClick={nativeShare} className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">
                  {copied === 'link' ? <Check size={17} className="text-emerald-300" /> : <Share2 size={17} />} {copied === 'link' ? 'Link copied' : 'Share link'}
                </button>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.2 }} className="mx-auto rounded-3xl bg-white p-3 shadow-glow-gold">
              {/* eslint-disable-next-line @next/next/no-img-element -- generated data: URL, nothing for next/image to optimise */}
              {qr ? <img src={qr} alt="QR code that opens your referral link" width={200} height={200} className="h-48 w-48 sm:h-52 sm:w-52" /> : <div className="h-48 w-48 animate-pulse rounded-2xl bg-cosmos-100 sm:h-52 sm:w-52" />}
              <p className="mt-2 text-center text-xs font-semibold text-cosmos-900">Scan to join</p>
            </motion.div>
          </div>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose-200">{error}</p>}

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, label: 'Friends joined', value: data ? data.totalReferees : '—' },
            { icon: Gift, label: 'VA Points earned', value: data ? pts(data.totalEarned) : '—' },
            { icon: TrendingUp, label: 'Pending this month', value: data ? pts(data.pendingRewards) : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass rounded-3xl p-5">
              <Icon size={20} className="text-gold" />
              <p className="mt-3 font-display text-3xl font-black">{value}</p>
              <p className="text-sm text-ink-2">{label}</p>
            </div>
          ))}
        </div>

        {/* Monthly progress */}
        {month && (
          <div className="glass mt-6 rounded-3xl p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-bold">{monthName(month.monthKey)}</h2>
              <p className="text-sm text-ink-2">Friends spent <b className="text-ink-1">₹{pts(month.totalRefereeSpending)}</b> of ₹{pts(month.threshold)}</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gold-grad" initial={{ width: 0 }} animate={{ width: `${month.progressPercent}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
            </div>
            <p className="mt-3 text-sm text-ink-2">
              {month.thresholdMet
                ? <>Unlocked — you’ll get about <b className="text-gold-soft">{pts(month.projectedBonus)} VA Points</b> for this month.</>
                : <>₹{pts(month.remainingToThreshold)} more from your friends this month unlocks your 10% bonus.</>}
            </p>
          </div>
        )}

        {/* Friends */}
        {data?.refereeBreakdown?.length > 0 && (
          <div className="glass mt-6 rounded-3xl p-6">
            <h2 className="font-bold">Your friends</h2>
            <ul className="mt-3">
              {data.refereeBreakdown.map((f) => (
                <li key={f.refereeId} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-grad text-sm font-black">{f.refereeName.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{f.refereeName}</p>
                    <p className="text-xs text-ink-3">Joined {new Date(f.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', f.signupBonusCredited ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/5 text-ink-3')}>
                    {f.signupBonusCredited ? '+100 earned' : 'Awaiting first recharge'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
