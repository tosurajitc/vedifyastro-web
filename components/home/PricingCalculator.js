'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Wallet } from 'lucide-react'
import Section from '@/components/ui/Section'
import { BONUS_TIERS, MIN_RECHARGE, PRICES, calculateVAPoints, formatInr } from '@/lib/pricing'
import { cn } from '@/lib/cn'

const PRESETS = [99, 499, 1000, 2000, 5000]

export default function PricingCalculator() {
  const [amount, setAmount] = useState(499)
  const { vaPoints, bonusPoints, bonusPercent } = calculateVAPoints(amount)
  const minutes = Math.floor(vaPoints / PRICES.chatPerMinute)
  const nextTier = [...BONUS_TIERS].reverse().find((t) => t.min > amount)

  return (
    <Section
      id="pricing"
      eyebrow="Simple pricing"
      title="Pay as you go. No subscription."
      lead="Recharge your wallet with VA Points (1 point = ₹1) and spend them on chats and reports. Bigger recharges earn bonus points."
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* Calculator */}
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-2">
            <Wallet size={16} className="text-gold" /> Recharge calculator
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-5xl font-black">{formatInr(amount)}</span>
            <AnimatePresence mode="wait">
              {bonusPercent > 0 && (
                <motion.span
                  key={bonusPercent}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-2 rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-300"
                >
                  +{bonusPercent}% bonus
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <label htmlFor="recharge" className="sr-only">Recharge amount in rupees</label>
          <input
            id="recharge"
            type="range"
            min={MIN_RECHARGE}
            max={6000}
            step={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-6 w-full accent-[#f59e0b]"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className={cn('rounded-full px-3.5 py-1.5 text-sm font-semibold transition', amount === p ? 'bg-gold text-cosmos-950' : 'border border-line-2 text-ink-2 hover:text-ink-1')}
              >
                {formatInr(p)}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="font-display text-2xl font-bold text-gold-grad">{vaPoints.toLocaleString('en-IN')}</div>
              <div className="text-xs text-ink-3">VA Points</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="font-display text-2xl font-bold">{bonusPoints.toLocaleString('en-IN')}</div>
              <div className="text-xs text-ink-3">Bonus points</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <div className="font-display text-2xl font-bold">{minutes.toLocaleString('en-IN')}</div>
              <div className="text-xs text-ink-3">Chat minutes</div>
            </div>
          </div>

          {nextTier && (
            <p className="mt-4 text-sm text-ink-2">
              Add {formatInr(nextTier.min - amount)} more to unlock a <span className="font-semibold text-gold">{nextTier.percent}% bonus</span>.
            </p>
          )}

          <Link href="/login?next=/wallet" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gold-grad py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110">
            Recharge {formatInr(amount)} securely with Razorpay
          </Link>
          <p className="mt-2 text-center text-xs text-ink-3">UPI, cards and net banking. Minimum {formatInr(MIN_RECHARGE)}.</p>
        </div>

        {/* Price list */}
        <div className="glass rounded-3xl p-6 sm:p-8">
          <h3 className="font-display text-xl font-bold">What things cost</h3>
          <ul className="mt-5 space-y-3">
            {[
              ['Kundli, panchang & horoscopes', 'Free'],
              ['First 3 minutes with Ask VA', 'Free'],
              ['AI astrologer chat', `₹${PRICES.chatPerMinute}/min`],
              ['Premium masters chat', `₹${PRICES.premiumChatPerMinute}/min`],
              ['Life-area report (1 year)', `₹${PRICES.report}`],
              ['Kundli matching', `₹${PRICES.kundliMatching}`],
              ['Personal remedies', `₹${PRICES.remedies}`],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-4 border-b border-line pb-3 text-sm last:border-0">
                <span className="flex items-center gap-2 text-ink-2"><Check size={15} className="text-emerald-400" /> {k}</span>
                <span className={v === 'Free' ? 'font-bold text-emerald-300' : 'font-bold text-ink-1'}>{v}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/5 p-4 text-sm text-ink-2">
            <span className="font-semibold text-gold">Bonus tiers:</span>{' '}
            {[...BONUS_TIERS].reverse().map((t) => `${formatInr(t.min)}+ → ${t.percent}%`).join(' · ')}
          </div>
        </div>
      </div>
    </Section>
  )
}
