'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import ZodiacWheel from '@/components/cosmic/ZodiacWheel'
import TodayCard from './TodayCard'

const fade = (delay) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pt-16">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.div {...fade(0)} className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-white/5 px-3 py-1.5 text-xs font-semibold text-ink-2">
            <Sparkles size={14} className="text-gold" />
            17 AI astrologers · 11 Indian languages · open 24×7
          </motion.div>

          <motion.h1 {...fade(0.08)} className="mt-6 font-display text-[2.35rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Your Vedic chart,
            <br />
            <span className="text-gold-grad">read by AI that knows Jyotish.</span>
          </motion.h1>

          <motion.p {...fade(0.16)} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Precise sidereal calculations from Swiss Ephemeris, explained by AI specialists for career, love, health and
            timing. Ask in your own language and get answers based on <em className="not-italic text-ink-1">your</em> kundli, not a generic sun sign.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login?next=/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold-grad px-6 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110"
            >
              Get my free kundli
              <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#agents"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line-2 bg-white/5 px-6 py-3.5 font-semibold text-ink-1 transition hover:bg-white/10"
            >
              <MessageCircle size={18} className="text-cosmos-300" />
              Talk to an AI astrologer
            </Link>
          </motion.div>

          <motion.div {...fade(0.32)} className="mt-6 flex items-center gap-2 text-sm text-ink-3">
            <ShieldCheck size={16} className="text-aqua" />
            First 3 minutes with Ask VA free · Birth details encrypted (AES-256)
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[460px]"
        >
          <ZodiacWheel />
          <div className="absolute -bottom-6 -left-2 w-[240px] sm:-left-10">
            <TodayCard />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
