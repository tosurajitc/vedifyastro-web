'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Clock, Loader2, Sparkles, Volume2, Wallet, X } from 'lucide-react'
import { replyParts, THINKING_LINES, FREE_SECONDS, VA_PRICE } from '@/lib/vaChat'
import { cn } from '@/lib/cn'

const timeOf = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
export const mmss = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

function FormattedText({ text }) {
  return (
    <p className="whitespace-pre-line leading-relaxed">
      {replyParts(text).map((p, i) => (p.bold ? <strong key={i} className="font-semibold text-gold-soft">{p.text}</strong> : <span key={i}>{p.text}</span>))}
    </p>
  )
}

export function MessageBubble({ msg, guide, onSpeak, speaking, needsTap }) {
  const mine = msg.role === 'user'
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={cn('flex items-end gap-2.5', mine && 'flex-row-reverse')}>
      {!mine && (
        <div className="relative mb-5 h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/40">
          <Image src={guide.avatar} alt="" fill sizes="32px" className="object-cover" />
        </div>
      )}
      <div className={cn('max-w-[85%] sm:max-w-[75%]', mine && 'text-right')}>
        <div className={cn('inline-block rounded-3xl px-4 py-3 text-left text-[15px]',
          mine ? 'rounded-br-md bg-gold-grad font-medium text-cosmos-950' : 'rounded-bl-md border border-line bg-white/[.07] text-ink-1')}>
          <FormattedText text={msg.content} />
        </div>
        <div className={cn('mt-1 flex items-center gap-2 px-1 text-[11px] text-ink-3', mine && 'justify-end')}>
          <span>{timeOf(msg.at)}</span>
          {!mine && onSpeak && (
            needsTap ? (
              <button type="button" onClick={onSpeak} className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 font-semibold text-gold-soft hover:bg-gold/25">
                <Volume2 size={12} /> Tap to hear {guide.name}
              </button>
            ) : (
              <button type="button" onClick={onSpeak} aria-label="Play this reply" className={cn('inline-flex items-center gap-1 hover:text-ink-1', speaking && 'text-gold-soft')}>
                <Volume2 size={12} className={speaking ? 'animate-pulse' : ''} /> {speaking ? 'Speaking' : 'Listen'}
              </button>
            )
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Follow-up card when VA suggests a specialist (ROUTE_TO) or the user picks one from the chips
export function SuggestionCard({ card, onDismiss }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }} className="ml-10 max-w-sm">
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-cosmos-600/50 to-cosmos-900 p-4">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/15 blur-2xl" aria-hidden="true" />
        {card.prompt && <p className="relative mb-3 text-sm text-ink-1">{card.prompt}</p>}
        <div className="relative flex items-center gap-3">
          {card.kind === 'horoscope' ? (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold"><CalendarDays size={26} /></span>
          ) : card.avatar ? (
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-2 ring-gold/50"><Image src={card.avatar} alt="" fill sizes="56px" className="object-cover" /></span>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-ink-1">{card.person || card.label}</p>
            {card.person && <p className="truncate text-xs text-ink-2">{card.label}</p>}
          </div>
        </div>
        <div className="relative mt-4 flex gap-2">
          <Link href={card.href} className="flex-1 rounded-full bg-gold-grad px-4 py-2.5 text-center text-sm font-bold text-cosmos-950 transition hover:brightness-110">
            {card.kind === 'horoscope' ? 'Open' : 'Connect'}
          </Link>
          {onDismiss && (
            <button type="button" onClick={onDismiss} className="rounded-full border border-line-2 px-4 py-2.5 text-sm font-semibold text-ink-2 hover:text-ink-1">Not now</button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function TypingBubble({ guide }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % THINKING_LINES.length), 1800)
    return () => clearInterval(t)
  }, [])
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2.5">
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-gold/40">
        <Image src={guide.avatar} alt="" fill sizes="32px" className="object-cover" />
      </div>
      <div className="rounded-3xl rounded-bl-md border border-line bg-white/[.07] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((d) => (
              <motion.span key={d} className="h-2 w-2 rounded-full bg-gold" animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }} />
            ))}
          </span>
          <AnimatePresence mode="wait">
            <motion.span key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-sm text-ink-2">
              {THINKING_LINES[i]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// Free countdown, then paid running time. Turns red in the last 30 free seconds.
export function TimerChip({ phase, seconds, spent }) {
  const left = FREE_SECONDS - seconds
  if (phase === 'paid' || (phase === 'blocked' && spent > 0)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-white/5 px-3 py-1.5 text-xs font-semibold text-ink-1" title="Time in paid conversation">
        <Clock size={13} className="text-gold" /> {mmss(Math.max(0, seconds - FREE_SECONDS))} · ₹{spent}
      </span>
    )
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums transition',
      phase === 'idle' ? 'border-line-2 bg-white/5 text-ink-2'
        : left <= 30 ? 'border-rose/50 bg-rose/15 text-rose-200' : 'border-gold/40 bg-gold/10 text-gold-soft')}
      title="Free time left">
      <Clock size={13} /> {mmss(phase === 'idle' ? FREE_SECONDS : left)} free
    </span>
  )
}

export function Dialog({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center bg-cosmos-950/70 p-4 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-gold/30 bg-cosmos-800 p-6 text-center shadow-glow">
            {onClose && (
              <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-ink-3 hover:text-ink-1"><X size={18} /></button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function TimeUpDialog({ open, guide, busy, onContinue, onEnd }) {
  return (
    <Dialog open={open} onClose={null}>
      <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full ring-2 ring-gold/60">
        <Image src={guide.avatar} alt="" fill sizes="80px" className="object-cover" />
      </div>
      <h3 className="mt-4 font-display text-xl font-black">Your 3 free minutes are up</h3>
      <p className="mt-2 text-sm text-ink-2">Keep talking with {guide.name} for ₹{VA_PRICE} a minute from your wallet. You can end anytime.</p>
      <button type="button" onClick={onContinue} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad px-5 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110 disabled:opacity-60">
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} Continue · ₹{VA_PRICE}/min
      </button>
      <button type="button" onClick={onEnd} disabled={busy} className="mt-3 w-full rounded-full border border-line-2 px-5 py-3 text-sm font-semibold text-ink-2 hover:text-ink-1">End chat</button>
    </Dialog>
  )
}

export function RechargeDialog({ open, onClose, onEnd }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold"><Wallet size={30} /></span>
      <h3 className="mt-4 font-display text-xl font-black">Add VA Points to continue</h3>
      <p className="mt-2 text-sm text-ink-2">You need at least ₹{VA_PRICE} for the next minute. Recharge, then come back to keep talking.</p>
      <Link href="/wallet?next=/chat/va" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad px-5 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110">
        <Wallet size={18} /> Recharge wallet
      </Link>
      <button type="button" onClick={onEnd} className="mt-3 w-full rounded-full border border-line-2 px-5 py-3 text-sm font-semibold text-ink-2 hover:text-ink-1">End chat</button>
    </Dialog>
  )
}
