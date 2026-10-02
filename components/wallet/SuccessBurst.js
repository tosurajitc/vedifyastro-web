'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, MessageCircle } from 'lucide-react'
import { PRICES } from '@/lib/pricing'
import CountUp from './CountUp'

// Gold sparks flying out from the centre
const SPARKS = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2
  const dist = 90 + (i % 3) * 30
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, size: 6 + (i % 4) * 2, delay: (i % 5) * 0.04 }
})

// Celebration after a successful recharge
export default function SuccessBurst({ result, guide, next, onClose }) {
  return (
    <AnimatePresence>
      {result && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-cosmos-950/80 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div role="dialog" aria-modal="true" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-gold/40 bg-gradient-to-br from-cosmos-600/80 via-cosmos-800 to-cosmos-900 p-8 text-center shadow-glow-gold">
            <div className="relative mx-auto grid h-24 w-24 place-items-center">
              {SPARKS.map((s, i) => (
                <motion.span key={i} className="absolute rounded-full bg-gold-grad" style={{ width: s.size, height: s.size }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }} animate={{ x: s.x, y: s.y, opacity: 0, scale: 1 }} transition={{ duration: 1.1, delay: 0.15 + s.delay, ease: 'easeOut' }} />
              ))}
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1, damping: 12 }} className="grid h-20 w-20 place-items-center rounded-full bg-gold-grad text-cosmos-950 shadow-glow-gold">
                <Check size={40} strokeWidth={3} />
              </motion.span>
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-gold">Recharge successful</p>
            <p className="mt-2 font-display text-5xl font-black text-gold-grad">
              +<CountUp value={result.vaPointsCredited} duration={1.4} />
            </p>
            <p className="mt-1 text-ink-2">VA Points added{result.bonusPoints > 0 ? `, including ${result.bonusPoints} bonus` : ''}</p>
            <p className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-sm text-ink-1">
              New balance <span className="font-bold text-gold-soft">{Math.floor(result.newBalance).toLocaleString('en-IN')}</span> · about {Math.floor(result.newBalance / PRICES.chatPerMinute)} minutes with {guide.name}
            </p>

            {next ? (
              <Link href={next} className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-gold-grad px-5 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110">
                <span className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-cosmos-950/30"><Image src={guide.avatar} alt="" fill sizes="28px" className="object-cover" /></span>
                Back to {guide.name}
              </Link>
            ) : (
              <Link href="/chat/va" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad px-5 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110">
                <MessageCircle size={18} /> Talk to {guide.name}
              </Link>
            )}
            <button type="button" onClick={onClose} className="mt-3 w-full rounded-full border border-line-2 px-5 py-3 text-sm font-semibold text-ink-2 hover:text-ink-1">Done</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
