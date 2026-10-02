'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { GUIDES } from '@/lib/guides'

// Savitri and Satyaban side by side, softly floating — the welcome visual on login and onboarding
export default function GuidePair({ compact = false }) {
  const size = compact ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-36 w-36 sm:h-44 sm:w-44'
  return (
    <div className={compact ? 'text-center' : 'text-center lg:text-left'}>
      <div className={`flex items-end gap-4 ${compact ? 'justify-center' : 'justify-center lg:justify-start'}`}>
        {[GUIDES.savitri, GUIDES.satyaban].map((g, i) => (
          <motion.div
            key={g.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { duration: 0.5, delay: i * 0.15 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 } }}
            className="flex flex-col items-center"
          >
            <div className="rounded-full bg-gold-grad p-1 shadow-glow-gold">
              <div className={`relative overflow-hidden rounded-full ${size}`}>
                <Image src={g.avatar} alt={g.name} fill sizes="176px" className="object-cover" priority />
              </div>
            </div>
            <span className="mt-3 text-sm font-bold text-gold-soft">{g.name}</span>
          </motion.div>
        ))}
      </div>

      {!compact && (
        <>
          <div className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
            <Sparkles size={12} /> Your AI guides
          </div>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl">
            Your chart is <span className="text-gold-grad">waiting</span> to be read
          </h1>
          <p className="mt-4 max-w-lg text-ink-2 lg:mx-0 mx-auto">
            Sign in once and Savitri or Satyaban will greet you, read your kundli and answer anything — in your own language.
          </p>
        </>
      )}
    </div>
  )
}
