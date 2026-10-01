'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, MessageCircle, Sparkles } from 'lucide-react'
import { AGENTS, AGENT_GROUPS } from '@/lib/agents'
import { PRICES } from '@/lib/pricing'
import { cn } from '@/lib/cn'
import Section from '@/components/ui/Section'

function FlagshipCard({ agent, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="glass group relative overflow-hidden rounded-3xl p-6"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-2xl transition group-hover:bg-gold/20" aria-hidden="true" />
      <div className="relative flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 ring-gold/40">
          <Image src={agent.avatar} alt="" fill sizes="80px" className="object-cover" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
            <Sparkles size={10} /> AI guide
          </div>
          <h3 className="mt-1 font-display text-lg font-bold">{agent.name}</h3>
          <p className="text-sm text-ink-2">{agent.title}</p>
        </div>
      </div>
      <p className="relative mt-4 text-sm leading-relaxed text-ink-2">{agent.blurb}</p>
      <div className="relative mt-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
          {agent.voice && <Mic size={13} className="text-aqua" />} {agent.voice ? 'Text & voice' : 'Text chat'}
        </span>
        <Link href={`/chat/${agent.key}`} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold transition hover:bg-gold hover:text-cosmos-950">
          <MessageCircle size={15} /> Start
        </Link>
      </div>
    </motion.div>
  )
}

function SpecialistCard({ agent }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/chat/${agent.key}`} className="glass group flex h-full flex-col items-center rounded-2xl p-4 text-center transition hover:border-gold/50">
        <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-cosmos-300/30 transition group-hover:ring-gold/60">
          <Image src={agent.avatar} alt="" fill sizes="80px" className="object-cover" />
          <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-cosmos-900 bg-emerald-400" aria-label="available" />
        </div>
        <h3 className="mt-3 font-display text-base font-bold">{agent.name}</h3>
        <p className="mt-0.5 text-xs leading-snug text-ink-2">{agent.title}</p>
        <span className="mt-3 rounded-full bg-cosmos-500/25 px-2.5 py-1 text-[11px] font-semibold text-cosmos-200 transition group-hover:bg-gold group-hover:text-cosmos-950">
          Chat · ₹{PRICES.chatPerMinute}/min
        </span>
      </Link>
    </motion.div>
  )
}

export default function AgentsShowcase() {
  const [group, setGroup] = useState('all')
  const flagships = AGENTS.filter((a) => a.flagship)
  const specialists = AGENTS.filter((a) => !a.flagship && (group === 'all' || a.group === group))

  return (
    <Section
      id="agents"
      eyebrow="AI astrologers"
      title="A specialist for every question"
      lead="Every agent reads your birth chart before it answers. Pick a guide for deep conversations, or a specialist for one area of life."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {flagships.map((a, i) => <FlagshipCard key={a.key} agent={a} i={i} />)}
      </div>

      <div className="mt-14 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter specialists">
        {AGENT_GROUPS.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={group === g.id}
            onClick={() => setGroup(g.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              group === g.id ? 'bg-gold text-cosmos-950 shadow-glow-gold' : 'border border-line-2 bg-white/5 text-ink-2 hover:text-ink-1'
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {specialists.map((a) => <SpecialistCard key={a.key} agent={a} />)}
        </AnimatePresence>
      </motion.div>

      <p className="mt-8 text-center text-xs text-ink-3">
        All specialists are AI personas trained on Vedic astrology. Guidance is for reflection, not a substitute for professional advice.
      </p>
    </Section>
  )
}
