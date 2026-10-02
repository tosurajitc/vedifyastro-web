'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, CalendarDays, Clock, Compass, Gem, Heart, Hourglass, MessageCircle, Moon, Orbit,
  RotateCcw, ScrollText, Sparkles, Star, Sun, Wallet,
} from 'lucide-react'
import { api } from '@/lib/api'
import { COLOR_HEX, MOOD, PLANET_COLOR, greetingFor, longDate, periodProgress } from '@/lib/dashboard'
import { cn } from '@/lib/cn'
import SunArc from './SunArc'

// Loads one dashboard endpoint; each card loads and fails on its own
function useCard(path) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const load = useCallback(async () => {
    setState({ loading: true, data: null, error: null })
    try {
      const res = await api(path)
      setState({ loading: false, data: res.data, error: null })
    } catch (e) {
      setState({ loading: false, data: null, error: e.message })
    }
  }, [path])
  useEffect(() => { load() }, [load])
  return { ...state, reload: load }
}

function Card({ title, icon: Icon, className, children, delay = 0, action }) {
  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.45 }}
      className={cn('glass relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[.16em] text-gold"><Icon size={16} /> {title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

function Skeleton({ rows = 3 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => <div key={i} className="h-5 animate-pulse rounded-full bg-white/10" style={{ width: `${90 - i * 15}%` }} />)}
    </div>
  )
}

function Failed({ error, onRetry }) {
  return (
    <div className="flex flex-col items-start gap-3 text-sm text-ink-2">
      <p>{error || 'Not available right now.'}</p>
      <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 font-semibold text-ink-1 hover:bg-white/5"><RotateCcw size={14} /> Try again</button>
    </div>
  )
}

function Tile({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">{label}</p>
      <p className="mt-1 font-bold" style={{ color }}>{value || '—'}</p>
    </div>
  )
}

function PanchangCard({ place }) {
  const { loading, data, error, reload } = useCard('/dashboard/panchang/today')
  return (
    <Card title="Today's sky" icon={Sun} className="lg:col-span-2" delay={0.05}
      action={place && <span className="text-xs text-ink-3">for {place}</span>}>
      {loading ? <Skeleton rows={4} /> : error ? <Failed error={error} onRetry={reload} /> : (
        <div className="grid items-center gap-6 md:grid-cols-[1.1fr_1fr]">
          <div>
            <SunArc sunrise={data.sunrise} sunset={data.sunset} rahuKaal={data.rahu_kaal} abhijit={data.abhijit_muhurat} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Abhijit · auspicious</p>
                <p className="mt-0.5 font-semibold text-ink-1">{data.abhijit_muhurat}</p>
              </div>
              <div className="rounded-2xl border border-rose/30 bg-rose/10 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-200">Rahu Kaal · avoid</p>
                <p className="mt-0.5 font-semibold text-ink-1">{data.rahu_kaal}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Tile label="Tithi" value={data.tithi} color="#A78BFA" />
            <Tile label="Paksha" value={data.paksha?.replace(' Paksha', '')} color="#60A5FA" />
            <Tile label="Nakshatra" value={data.nakshatra} color="#FFB300" />
            <Tile label="Yoga" value={data.yoga} color="#34D399" />
            <Tile label="Karana" value={data.karana} color="#F472B6" />
            <Tile label="Day length" value={dayLength(data.sunrise, data.sunset)} color="#F0EAFF" />
          </div>
        </div>
      )}
    </Card>
  )
}

function dayLength(rise, set) {
  const toMin = (t) => { const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t || ''); if (!m) return null; return ((+m[1] % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + +m[2] }
  const a = toMin(rise), b = toMin(set)
  return a != null && b != null && b > a ? `${Math.floor((b - a) / 60)}h ${(b - a) % 60}m` : null
}

function LuckyCard() {
  const { loading, data, error, reload } = useCard('/dashboard/lucky-elements/today')
  const hex = data?.colorCode || COLOR_HEX[(data?.color || '').toLowerCase()] || '#f59e0b'
  return (
    <Card title="Lucky today" icon={Star} delay={0.1}>
      {loading ? <Skeleton /> : error ? <Failed error={error} onRetry={reload} /> : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <motion.span initial={{ scale: 0.6, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 12 }}
              className="h-14 w-14 shrink-0 rounded-2xl ring-2 ring-white/20" style={{ background: hex, boxShadow: `0 0 30px ${hex}66` }} />
            <div>
              <p className="text-xs text-ink-3">Colour</p>
              <p className="text-xl font-black">{data.color}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-ink-3">Numbers</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {(data.numbers || []).map((n, i) => (
                <span key={`${n}-${i}`} className={cn('grid h-10 w-10 place-items-center rounded-full font-black', i === 0 ? 'bg-gold-grad text-cosmos-950' : 'bg-white/10 text-ink-1')}>{n}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="flex items-center gap-2 rounded-2xl bg-white/5 p-3"><Compass size={16} className="shrink-0 text-gold" /> {data.direction}</p>
            <p className="flex items-center gap-2 rounded-2xl bg-white/5 p-3"><Gem size={16} className="shrink-0 text-gold" /> {data.gemstone}</p>
            {data.time && <p className="col-span-2 flex items-center gap-2 rounded-2xl bg-white/5 p-3"><Clock size={16} className="shrink-0 text-gold" /> Good time: {data.time}</p>}
          </div>
        </div>
      )}
    </Card>
  )
}

function InsightCard({ guide }) {
  const { loading, data, error, reload } = useCard('/dashboard/insights/today')
  const mood = MOOD[data?.mood] || MOOD.neutral
  return (
    <Card title="Today's insight" icon={Sparkles} delay={0.15} className="lg:col-span-2">
      {loading ? <Skeleton rows={4} /> : error ? <Failed error={error} onRetry={reload} /> : (
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${mood.color}22`, color: mood.color }}>
              <span className="h-2 w-2 rounded-full" style={{ background: mood.color }} /> {mood.label}
            </span>
            <blockquote className="mt-4 text-lg leading-relaxed text-ink-1">“{data.text}”</blockquote>
            {data.advice && <p className="mt-3 text-sm leading-relaxed text-ink-2"><b className="text-gold-soft">Advice:</b> {data.advice}</p>}
          </div>
          <Link href="/chat/va" className="inline-flex items-center gap-2 self-start rounded-full border border-gold/40 px-4 py-2.5 text-sm font-semibold text-gold-soft transition hover:bg-gold hover:text-cosmos-950 md:self-end">
            <MessageCircle size={16} /> Ask {guide.name} about today
          </Link>
        </div>
      )}
    </Card>
  )
}

function DashaCard() {
  const { loading, data, error, reload } = useCard('/dashboard/dasha/current')
  const color = PLANET_COLOR[data?.mahadasha] || '#f59e0b'
  const pct = data ? periodProgress(data.startDate, data.endDate) : null
  return (
    <Card title="Current dasha" icon={Hourglass} delay={0.2}>
      {loading ? <Skeleton /> : error ? <Failed error={error} onRetry={reload} /> : (
        <div>
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-black text-cosmos-950" style={{ background: color, boxShadow: `0 0 28px ${color}66` }}>
              {(data.mahadasha || '?').slice(0, 2)}
            </span>
            <div>
              <p className="text-xl font-black">{data.mahadasha} Mahadasha</p>
              {data.remaining && data.remaining !== 'N/A' && <p className="text-sm text-ink-2">{data.remaining} remaining</p>}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Tile label="Antardasha" value={data.antardasha} color={PLANET_COLOR[data.antardasha]} />
            <Tile label="Pratyantar" value={data.pratyantardasha && data.pratyantardasha !== 'N/A' ? data.pratyantardasha : null} color={PLANET_COLOR[data.pratyantardasha]} />
          </div>
          {pct != null && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-ink-3"><span>{longDate(data.startDate)}</span><span>{longDate(data.endDate)}</span></div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

const EXPLORE = [
  { href: '/kundli', label: 'My kundli', text: 'Chart, planets, houses, dashas', icon: Orbit },
  { href: '/horoscope/daily', label: 'Daily horoscope', text: 'Career, money, health, love', icon: Sun },
  { href: '/horoscope/monthly', label: 'This month', text: 'Your month at a glance', icon: CalendarDays },
  { href: '/horoscope/yearly', label: 'Year ahead', text: 'Quarter by quarter', icon: Moon },
  { href: '/kundli/matching', label: 'Kundli matching', text: 'Guna milan for couples', icon: Heart },
  { href: '/reports/career', label: 'Life reports', text: 'Year-long deep dives', icon: ScrollText },
]

export default function Dashboard({ firstName, guide, place }) {
  const [greeting, setGreeting] = useState('Namaste')
  const [today, setToday] = useState('')
  useEffect(() => {
    setGreeting(greetingFor())
    setToday(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }))
  }, [])

  return (
    <section className="py-8 sm:py-12">
      <div className="wrap">
        {/* Hero */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-ink-2">{today}</p>
            <h1 className="mt-1 font-display text-4xl font-black tracking-tight sm:text-5xl">{greeting}, <span className="text-gold-grad">{firstName}</span></h1>
            <p className="mt-2 text-ink-2">Here’s what the sky holds for you today.</p>
          </div>
          <Link href="/chat/va" className="group flex items-center gap-3 rounded-full border border-gold/30 bg-gold/10 py-2 pl-2 pr-5 transition hover:border-gold/60">
            <span className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-gold/60"><Image src={guide.avatar} alt="" fill sizes="44px" className="object-cover" /></span>
            <span><span className="block text-sm font-bold">Talk to {guide.name}</span><span className="block text-xs text-ink-2">3 minutes free</span></span>
            <ArrowRight size={16} className="text-gold transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <PanchangCard place={place} />
          <LuckyCard />
          <InsightCard guide={guide} />
          <DashaCard />
        </div>

        {/* Explore */}
        <h2 className="mt-12 font-display text-2xl font-black tracking-tight">Explore your chart</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {EXPLORE.map(({ href, label, text, icon: Icon }, i) => (
            <motion.div key={href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
              <Link href={href} className="group flex h-full flex-col rounded-3xl border border-line-2 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-gold/50">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/15 text-gold transition group-hover:bg-gold group-hover:text-cosmos-950"><Icon size={20} /></span>
                <span className="mt-3 font-bold text-ink-1">{label}</span>
                <span className="mt-0.5 text-xs text-ink-3">{text}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        <Link href="/wallet" className="mt-6 flex items-center gap-3 rounded-3xl border border-line-2 bg-white/5 p-4 text-sm transition hover:border-gold/50">
          <Wallet size={18} className="text-gold" /> <span className="flex-1 text-ink-2">Top up your wallet to keep talking after the free minutes — bigger recharges get up to 30% bonus.</span>
          <ArrowRight size={16} className="text-gold" />
        </Link>
      </div>
    </section>
  )
}
