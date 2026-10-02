import Image from 'next/image'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

// "Ask in your language" band under the hero: greetings in the 11 supported languages drift into a
// glowing centre, and what the user gets back drifts out the other side. Pure CSS animation.

// Greeting in each language's own script (same 11 as onboarding / preferred_language)
const HELLO = {
  English: { text: 'Hello', dot: 'bg-sky-400' },
  Hindi: { text: 'नमस्ते', dot: 'bg-orange-400' },
  Bengali: { text: 'নমস্কার', dot: 'bg-rose-400' },
  Tamil: { text: 'வணக்கம்', dot: 'bg-amber-300' },
  Telugu: { text: 'నమస్కారం', dot: 'bg-emerald-400' },
  Kannada: { text: 'ನಮಸ್ಕಾರ', dot: 'bg-yellow-300' },
  Malayalam: { text: 'നമസ്കാരം', dot: 'bg-teal-300' },
  Marathi: { text: 'नमस्कार', dot: 'bg-fuchsia-400' },
  Punjabi: { text: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', dot: 'bg-lime-300' },
  Gujarati: { text: 'નમસ્તે', dot: 'bg-violet-400' },
  Odia: { text: 'ନମସ୍କାର', dot: 'bg-cyan-300' },
}

const IN_ROWS = [
  { langs: ['Hindi', 'Bengali', 'Tamil', 'English'], speed: '46s' },
  { langs: ['Telugu', 'Marathi', 'Gujarati', 'Odia'], speed: '58s' },
  { langs: ['Kannada', 'Malayalam', 'Punjabi', 'Hindi'], speed: '52s' },
  { langs: ['Bengali', 'English', 'Tamil', 'Telugu'], speed: '64s' },
]

const OUT_ROWS = [
  { items: ['Your kundli in Hindi', 'Daily horoscope in Tamil', 'Spoken replies in Bengali', 'Remedies in Marathi'], speed: '54s' },
  { items: ['Kundli matching in Telugu', 'Career guidance in Gujarati', 'Yearly forecast in Kannada', 'Chat in Odia'], speed: '62s' },
  { items: ['Reports in Malayalam', 'Answers in Punjabi', 'Love & marriage in Hindi', 'Dasha timing in English'], speed: '48s' },
]

// Row centres inside the 224px-tall columns; the connector curves start/end here
const IN_Y = [22, 82, 142, 202]
const OUT_Y = [40, 112, 184]
const MID = 112

function Track({ children, speed }) {
  // Content rendered twice; the -50% → 0 keyframe loops seamlessly while moving right
  return (
    <div className="flex h-11 overflow-hidden">
      <div className="flex w-max animate-marquee-rev items-center hover:[animation-play-state:paused] motion-reduce:animate-none" style={{ animationDuration: speed }}>
        {children}
        {children}
      </div>
    </div>
  )
}

function HelloPill({ lang }) {
  const h = HELLO[lang]
  return (
    <span className="mr-3 inline-flex shrink-0 items-center gap-2.5 rounded-full border border-line-2 bg-cosmos-800/70 px-4 py-2 backdrop-blur">
      <span className={cn('h-2 w-2 rounded-full', h.dot)} aria-hidden="true" />
      <span className="text-[15px] font-bold text-ink-1">{h.text}</span>
      <span className="text-xs text-ink-3">{lang}</span>
    </span>
  )
}

function OutPill({ text }) {
  return (
    <span className="mr-3 inline-flex shrink-0 items-center gap-2 rounded-full border border-gold/30 bg-gold/[.08] px-4 py-2 text-[15px] font-semibold text-gold-soft">
      <Check size={15} className="shrink-0" /> {text}
    </span>
  )
}

function Connectors({ from, to, side }) {
  // side 'in': many rows → one point on the right; 'out': one point on the left → many rows
  const paths = side === 'in'
    ? from.map((y) => `M0 ${y} C 60 ${y}, 40 ${MID}, 100 ${MID}`)
    : to.map((y) => `M0 ${MID} C 60 ${MID}, 40 ${y}, 100 ${y}`)
  const stroke = side === 'in' ? 'rgba(245,158,11,.55)' : 'rgba(182,127,245,.6)'
  return (
    <svg viewBox="0 0 100 224" preserveAspectRatio="none" className="hidden h-56 w-full lg:block" aria-hidden="true">
      {paths.map((d) => (
        <path key={d} d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 8" vectorEffect="non-scaling-stroke" className="animate-dash motion-reduce:animate-none" />
      ))}
    </svg>
  )
}

function Orb() {
  return (
    <div className="relative mx-auto grid h-48 w-48 place-items-center lg:h-60 lg:w-60">
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,.45) 0%, rgba(147,51,234,.22) 38%, transparent 70%)' }} aria-hidden="true" />
      {['inset-0', 'inset-[12%]', 'inset-[24%]', 'inset-[36%]'].map((inset, i) => (
        <span key={inset} className={cn('absolute animate-breathe rounded-full border', inset, i < 2 ? 'border-gold/15' : 'border-gold/30')} style={{ animationDelay: `${i * 0.6}s` }} aria-hidden="true" />
      ))}
      <Image src="/brand/logo.webp" alt="" width={84} height={84} className="relative drop-shadow-[0_0_24px_rgba(245,158,11,.6)]" />
      {/* Junctions where the lines meet the orb */}
      <span className="absolute left-0 top-1/2 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-1 ring-4 ring-white/15 lg:block" aria-hidden="true" />
      <span className="absolute right-0 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-ink-1 ring-4 ring-white/15 lg:block" aria-hidden="true" />
    </div>
  )
}

export default function LanguageFlow() {
  return (
    <section aria-labelledby="languages-title" className="relative overflow-hidden pb-16 pt-4 sm:pb-20 sm:pt-6">
      <div className="wrap mb-10 text-center">
        <p className="eyebrow">11 Indian languages</p>
        <h2 id="languages-title" className="mt-3 font-display text-3xl font-black tracking-tight md:text-4xl">
          Ask in your language. <span className="text-gold-grad">Hear your chart in it.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-ink-2">Pick your language once — every chat, report and spoken reply follows it.</p>
      </div>

      {/* grid-cols-1 = minmax(0,1fr): without it the implicit column grows to the rows' full track width */}
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_96px_15rem_96px_minmax(0,1fr)] lg:gap-0">
        {/* Languages in */}
        <div className="flex h-56 flex-col justify-between [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent,#000_12%,#000_78%,transparent)]">
          {IN_ROWS.map((row, i) => (
            <Track key={i} speed={row.speed}>
              {[...row.langs, ...row.langs].map((l, j) => <HelloPill key={`${l}-${j}`} lang={l} />)}
            </Track>
          ))}
        </div>

        <Connectors from={IN_Y} side="in" />
        <Orb />
        <Connectors to={OUT_Y} side="out" />

        {/* What comes back */}
        <div className="flex h-56 flex-col justify-center gap-7 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent,#000_22%,#000_88%,transparent)]">
          {OUT_ROWS.map((row, i) => (
            <Track key={i} speed={row.speed}>
              {[...row.items, ...row.items].map((t, j) => <OutPill key={`${t}-${j}`} text={t} />)}
            </Track>
          ))}
        </div>
      </div>
    </section>
  )
}
