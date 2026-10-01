'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Crown, Mic, MessageCircle, Sparkles, Users } from 'lucide-react'
import { AGENTS, AGENT_GROUPS } from '@/lib/agents'
import { PRICES } from '@/lib/pricing'
import { cn } from '@/lib/cn'
import Section from '@/components/ui/Section'

const ONBOARDING_STEPS = [
  'Greets you the moment you log in',
  'Reads your kundli and answers anything',
  'Brings in the right specialist when you need depth',
]

// Label + hairline that separates the three tiers
function TierHeading({ icon: Icon, label, note }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-[.18em] text-gold">
        <Icon size={16} /> {label}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" aria-hidden="true" />
      {note && <span className="hidden shrink-0 text-sm text-ink-3 sm:inline">{note}</span>}
    </div>
  )
}

// Satyaban & Savitri: the guide every user meets first after login
function OnboardingCard({ agent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-cosmos-600/50 via-cosmos-800/70 to-cosmos-900 p-6 sm:p-10"
    >
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-cosmos-400/20 blur-3xl" aria-hidden="true" />

      <div className="relative grid items-center gap-8 md:grid-cols-[auto,1fr] md:gap-12">
        <div className="flex flex-col items-center">
          <div className="relative">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold/20 [animation-duration:3s]" aria-hidden="true" />
            <div className="relative rounded-full bg-gold-grad p-1 shadow-glow-gold">
              <div className="relative h-40 w-40 overflow-hidden rounded-full sm:h-52 sm:w-52">
                <Image src={agent.avatar} alt="" fill sizes="208px" className="object-cover" />
              </div>
            </div>
          </div>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" /> Speaks first
          </span>
        </div>

        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
            <Sparkles size={12} /> Your first AI guide
          </div>
          <h3 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">{agent.name}</h3>
          <p className="mt-1 text-lg font-semibold text-gold-soft">{agent.title}</p>
          <p className="mt-4 max-w-xl leading-relaxed text-ink-2 md:mx-0 mx-auto">{agent.blurb}</p>

          <ul className="mt-6 space-y-2.5">
            {ONBOARDING_STEPS.map((step) => (
              <li key={step} className="flex items-center justify-center gap-3 text-sm text-ink-1 md:justify-start">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold"><Check size={14} /></span>
                {step}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
            <Link
              href={`/login?next=/chat/${agent.key}`}
              className="group inline-flex items-center gap-2 rounded-full bg-gold-grad px-6 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110"
            >
              Meet {agent.name} <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
            <span className="inline-flex items-center gap-2 text-sm text-ink-2">
              <Mic size={15} className="text-aqua" /> Text & voice · ₹{PRICES.chatPerMinute}/min
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Jyotish Guru and Vishwa Jyotishi: gold-framed, higher-priced masters
function PremiumCard({ agent, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group rounded-3xl bg-gradient-to-br from-gold-soft/80 via-gold/20 to-cosmos-500/40 p-px"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-cosmos-900/95 p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl transition group-hover:bg-gold/20" aria-hidden="true" />

        <div className="relative flex items-start gap-5">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-2 ring-gold/60 sm:h-28 sm:w-28">
            <Image src={agent.avatar} alt="" fill sizes="112px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-grad px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cosmos-950">
                <Crown size={12} /> Premium master
              </span>
              <span className="text-sm font-bold text-gold-soft">₹{PRICES.premiumChatPerMinute}<span className="font-medium text-ink-3">/min</span></span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-black tracking-tight">{agent.name}</h3>
            <p className="mt-0.5 text-sm text-ink-2">{agent.title}</p>
          </div>
        </div>

        <p className="relative mt-5 leading-relaxed text-ink-2">{agent.blurb}</p>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {agent.highlights?.map((h) => (
            <span key={h} className="rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-xs font-medium text-gold-soft">{h}</span>
          ))}
        </div>

        <div className="relative mt-auto flex items-center justify-between pt-7">
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
            {agent.voice && <Mic size={13} className="text-aqua" />} {agent.voice ? 'Text & voice' : 'Text chat'}
          </span>
          <Link
            href={`/chat/${agent.key}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-4 py-2 text-sm font-semibold text-gold-soft transition hover:bg-gold hover:text-cosmos-950"
          >
            <MessageCircle size={15} /> Consult
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// Sized so 3–4 cards fill the content width on desktop (about 1.2 on a phone)
function SpecialistCard({ agent, hidden }) {
  return (
    <div className="w-[78vw] shrink-0 pr-5 sm:w-[300px] lg:w-[320px]" aria-hidden={hidden || undefined}>
      <Link
        href={`/chat/${agent.key}`}
        tabIndex={hidden ? -1 : undefined}
        className="glass group flex h-full flex-col items-center rounded-3xl px-6 py-8 text-center transition duration-300 hover:-translate-y-1.5 hover:border-gold/50"
      >
        <div className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-cosmos-300/30 transition group-hover:ring-gold/60">
          <Image src={agent.avatar} alt="" fill sizes="112px" className="object-cover" />
          <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-cosmos-900 bg-emerald-400" aria-label="available" />
        </div>
        <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
          <Sparkles size={10} /> AI specialist
        </div>
        <h3 className="mt-2 font-display text-xl font-bold">{agent.name}</h3>
        <p className="mt-1 text-sm leading-snug text-ink-2">{agent.title}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-cosmos-500/25 px-4 py-2 text-sm font-semibold text-cosmos-200 transition group-hover:bg-gold group-hover:text-cosmos-950">
          <MessageCircle size={15} /> Chat · ₹{PRICES.chatPerMinute}/min
        </span>
      </Link>
    </div>
  )
}

// Single row that scrolls right-to-left forever. The track holds the list twice and the
// marquee keyframe moves it by -50%, so the loop is seamless. Hover or focus pauses it.
function SpecialistMarquee({ agents }) {
  // Short filtered lists are repeated so one half of the track is always wider than the screen
  let base = agents
  while (base.length > 0 && base.length < 8) base = base.concat(agents)
  const duration = `${base.length * 5}s`

  return (
    <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)] motion-reduce:overflow-x-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex w-max animate-marquee py-3 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: duration }}
      >
        {base.map((a, i) => <SpecialistCard key={`a-${i}`} agent={a} hidden={i >= agents.length} />)}
        {base.map((a, i) => <SpecialistCard key={`b-${i}`} agent={a} hidden />)}
      </motion.div>
    </div>
  )
}

export default function AgentsShowcase() {
  const [group, setGroup] = useState('all')
  const onboarding = AGENTS.find((a) => a.tier === 'onboarding')
  const premium = AGENTS.filter((a) => a.tier === 'premium')
  const allSpecialists = AGENTS.filter((a) => !a.tier)
  const specialists = allSpecialists.filter((a) => group === 'all' || a.group === group)

  return (
    <Section
      id="agents"
      eyebrow="AI astrologers"
      title="A specialist for every question"
      lead={`Every agent reads your birth chart before it answers. ${onboarding.name} welcome you first, then bring in a premium master or one of ${allSpecialists.length} specialists when you need depth.`}
    >
      <OnboardingCard agent={onboarding} />

      <div className="mt-20">
        <TierHeading icon={Crown} label="Premium masters" note="Deeper, classical readings" />
        <div className="grid gap-6 md:grid-cols-2">
          {premium.map((a, i) => <PremiumCard key={a.key} agent={a} i={i} />)}
        </div>
      </div>

      <div className="mt-20">
        <TierHeading icon={Users} label="Specialists" note={`${allSpecialists.length} areas of life · ₹${PRICES.chatPerMinute}/min`} />
      </div>

      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter specialists">
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

      <SpecialistMarquee key={group} agents={specialists} />

      <p className="mt-8 text-center text-xs text-ink-3">
        All specialists are AI personas trained on Vedic astrology. Guidance is for reflection, not a substitute for professional advice.
      </p>
    </Section>
  )
}
