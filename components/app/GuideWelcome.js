'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, MessageCircle, Mic, Sparkles } from 'lucide-react'
import { PRICES } from '@/lib/pricing'

// Questions people most often open with; Phase 3 makes them tappable starters in the chat
const STARTERS = [
  'When will my career take off?',
  'Is this a good year for marriage?',
  'Which planet is affecting me right now?',
  'What does my kundli say about money?',
]

export default function GuideWelcome({ guide, firstName }) {
  return (
    <section className="py-12 sm:py-20">
      <div className="wrap max-w-4xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-cosmos-600/50 via-cosmos-800/70 to-cosmos-900 p-6 text-center sm:p-12">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cosmos-400/20 blur-3xl" aria-hidden="true" />

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative mx-auto w-fit">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/20 [animation-duration:3s]" aria-hidden="true" />
            <div className="relative rounded-full bg-gold-grad p-1 shadow-glow-gold">
              <div className="relative h-40 w-40 overflow-hidden rounded-full sm:h-52 sm:w-52">
                <Image src={guide.avatar} alt={guide.name} fill sizes="208px" className="object-cover" priority />
              </div>
            </div>
            <span className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-400/30 bg-cosmos-900 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" /> Online
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="relative">
            <div className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
              <Sparkles size={12} /> Your AI guide
            </div>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
              Namaste {firstName}, I&apos;m <span className="text-gold-grad">{guide.name}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-2">{guide.intro}</p>
          </motion.div>

          <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } } }} className="relative mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
            {STARTERS.map((q) => (
              <motion.li key={q} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                className="rounded-full border border-line-2 bg-white/5 px-4 py-2 text-sm text-ink-1">
                “{q}”
              </motion.li>
            ))}
          </motion.ul>

          <div className="relative mt-10 flex flex-col items-center gap-3">
            <button type="button" disabled className="inline-flex items-center gap-2 rounded-full bg-gold-grad px-7 py-3.5 font-bold text-cosmos-950 opacity-60">
              <MessageCircle size={18} /> Chat opens here very soon
            </button>
            <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-ink-2">
              <span className="inline-flex items-center gap-1.5"><Clock size={14} className="text-gold" /> First 3 minutes free</span>
              <span className="inline-flex items-center gap-1.5"><Mic size={14} className="text-aqua" /> Text & voice</span>
              <span>Then ₹{PRICES.chatPerMinute}/min</span>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-3">
          Your kundli is being calculated in the background from the details you shared.
        </p>
      </div>
    </section>
  )
}
