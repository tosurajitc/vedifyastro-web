'use client'

import { motion } from 'framer-motion'
import { Sun } from 'lucide-react'

// Floating "today" card in the hero. Sample values for the UI phase; it will read
// GET /api/dashboard/panchang/today once the data phase is wired up.
const SAMPLE = [
  { label: 'Tithi', value: 'Shukla Navami' },
  { label: 'Nakshatra', value: 'Pushya' },
  { label: 'Rahu Kaal', value: '1:30 – 3:00 PM' },
]

export default function TodayCard() {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="glass animate-float rounded-2xl p-4 shadow-glow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-gold">
          <Sun size={14} /> Today&apos;s Panchang
        </div>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-ink-3">sample</span>
      </div>
      <div className="mt-1 text-xs text-ink-2" suppressHydrationWarning>{today}</div>
      <dl className="mt-3 space-y-1.5">
        {SAMPLE.map((r) => (
          <div key={r.label} className="flex justify-between gap-3 text-sm">
            <dt className="text-ink-3">{r.label}</dt>
            <dd className="font-semibold text-ink-1">{r.value}</dd>
          </div>
        ))}
      </dl>
    </motion.div>
  )
}
