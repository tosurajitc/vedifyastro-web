'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronDown, Clock, MapPin, MessageCircle, Orbit, RotateCcw, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { PLANET_COLOR } from '@/lib/dashboard'
import { HOUSE_THEME, PLANET_HINDI, SIGN_GLYPH, fmtDate, fmtDegree, isNow } from '@/lib/kundli'
import { cn } from '@/lib/cn'
import NorthIndianChart from './NorthIndianChart'
import KundliPdf from './KundliPdf'

const TABS = [
  { id: 'chart', label: 'Chart' },
  { id: 'planets', label: 'Planets' },
  { id: 'houses', label: 'Houses' },
  { id: 'dasha', label: 'Dasha' },
  { id: 'yogas', label: 'Yogas' },
  { id: 'report', label: 'PDF report' },
]

const LINES = ['Casting your chart…', 'Placing the planets…', 'Counting your dashas…', 'Almost ready…']

function Loading() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % LINES.length), 1500); return () => clearInterval(t) }, [])
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="grid h-24 w-24 place-items-center rounded-full border-2 border-dashed border-gold/50">
        <Orbit size={36} className="text-gold" />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-6 text-gold-soft">{LINES[i]}</motion.p>
      </AnimatePresence>
    </div>
  )
}

function Chip({ label, value, glyph }) {
  return (
    <div className="rounded-2xl border border-line-2 bg-white/5 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">{label}</p>
      <p className="mt-0.5 font-bold text-ink-1">{glyph && <span className="mr-1.5 text-gold">{glyph}</span>}{value || '—'}</p>
    </div>
  )
}

function HouseDetail({ house, planets }) {
  if (!house) return null
  const inHouse = planets.filter((p) => p.house === house.house)
  return (
    <motion.div key={house.house} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-5">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-gold">House {house.house}{house.name ? ` · ${house.name}` : ''}</p>
      <p className="mt-2 text-2xl font-black">{SIGN_GLYPH[house.sign]} {house.sign}</p>
      <p className="mt-1 text-sm text-ink-2">{house.represents || HOUSE_THEME[house.house - 1]}</p>
      <p className="mt-3 text-sm text-ink-2">Lord: <b className="text-ink-1">{house.lord}</b></p>
      <div className="mt-4 space-y-2">
        {inHouse.length ? inHouse.map((p) => (
          <div key={p.name} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm">
            <span className="font-semibold" style={{ color: PLANET_COLOR[p.name] }}>{p.name}{p.retrograde && <span className="ml-1 text-xs text-cosmos-300">℞</span>}</span>
            <span className="text-ink-2">{fmtDegree(p.degree)} · {p.nakshatra} {p.pada}</span>
          </div>
        )) : <p className="text-sm text-ink-3">No planets here — this house is read through its lord, {house.lord}.</p>}
      </div>
    </motion.div>
  )
}

function DashaTimeline({ dasha }) {
  const current = dasha.timeline.findIndex((m) => isNow(m.start, m.end))
  const [open, setOpen] = useState(current >= 0 ? current : 0)
  return (
    <div className="space-y-3">
      {dasha.current && (
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-cosmos-600/50 to-cosmos-900 p-5">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-gold">Running now</p>
          <p className="mt-2 text-2xl font-black">
            <span style={{ color: PLANET_COLOR[dasha.current.mahadasha] }}>{dasha.current.mahadasha}</span>
            <span className="text-ink-3"> › </span><span style={{ color: PLANET_COLOR[dasha.current.antardasha] }}>{dasha.current.antardasha}</span>
            {dasha.current.pratyantardasha && dasha.current.pratyantardasha !== 'N/A' && <><span className="text-ink-3"> › </span><span style={{ color: PLANET_COLOR[dasha.current.pratyantardasha] }}>{dasha.current.pratyantardasha}</span></>}
          </p>
          <p className="mt-1 text-sm text-ink-2">Mahadasha · Antardasha · Pratyantar{dasha.current.remaining ? ` — ${dasha.current.remaining} left in this mahadasha` : ''}</p>
        </div>
      )}
      {dasha.birthLord && (
        <p className="text-sm text-ink-2">Born in <b className="text-ink-1">{dasha.birthLord}</b> mahadasha with {dasha.balanceAtBirthYears} years remaining.</p>
      )}
      <ol className="relative space-y-2 border-l border-line-2 pl-5">
        {dasha.timeline.map((m, i) => {
          const live = i === current
          const past = new Date(m.end) < new Date()
          return (
            <li key={`${m.lord}-${m.start}`} className="relative">
              <span className={cn('absolute -left-[27px] top-4 h-3.5 w-3.5 rounded-full ring-4 ring-cosmos-900', live ? 'animate-pulse' : '')} style={{ background: past && !live ? 'rgba(157,142,192,.4)' : PLANET_COLOR[m.lord] }} />
              <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}
                className={cn('flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition', live ? 'border-gold/50 bg-gold/10' : 'border-line bg-white/5 hover:border-line-2', past && !live && 'opacity-60')}>
                <span className="w-24 shrink-0 font-bold" style={{ color: PLANET_COLOR[m.lord] }}>{m.lord}</span>
                <span className="flex-1 text-sm text-ink-2">{fmtDate(m.start)} – {fmtDate(m.end)}</span>
                <span className="hidden text-xs text-ink-3 sm:inline">{m.years} yrs</span>
                {live && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-black uppercase text-cosmos-950">Now</span>}
                <ChevronDown size={16} className={cn('shrink-0 text-ink-3 transition', open === i && 'rotate-180')} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid gap-1.5 px-2 pb-1 pt-2 sm:grid-cols-3">
                      {m.antardashas.map((a) => {
                        const aLive = isNow(a.start, a.end)
                        return (
                          <div key={`${a.lord}-${a.start}`} className={cn('rounded-xl px-3 py-2 text-xs', aLive ? 'bg-gold/20 ring-1 ring-gold/60' : 'bg-white/5')}>
                            <span className="font-semibold" style={{ color: PLANET_COLOR[a.lord] }}>{m.lord.slice(0, 2)}–{a.lord}</span>
                            <span className="block text-ink-3">{fmtDate(a.start)} – {fmtDate(a.end)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default function KundliView({ guide }) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [tab, setTab] = useState('chart')
  const [selected, setSelected] = useState(1)

  const load = useCallback(async () => {
    setState({ loading: true, data: null, error: null })
    try {
      const res = await api('/kundli/chart')
      setState({ loading: false, data: res.data, error: null })
    } catch (e) {
      setState({ loading: false, data: null, error: e.message })
    }
  }, [])
  useEffect(() => { load() }, [load])

  const k = state.data
  const moon = useMemo(() => k?.planets.find((p) => p.name === 'Moon'), [k])

  return (
    <section className="py-8 sm:py-12">
      <div className="wrap">
        {state.loading ? <Loading /> : state.error ? (
          <div className="py-24 text-center">
            <p className="text-ink-2">{state.error}</p>
            <button type="button" onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-grad px-5 py-3 font-bold text-cosmos-950"><RotateCcw size={16} /> Try again</button>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Janma Kundli</p>
                <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-5xl">{k.name}</h1>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="text-gold" /> {fmtDate(k.birth.date)}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock size={14} className="text-gold" /> {k.birth.time}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-gold" /> {k.birth.place}</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Chip label="Ascendant" value={`${k.ascendant.sign}${k.ascendant.degree != null ? ` ${fmtDegree(k.ascendant.degree)}` : ''}`} glyph={SIGN_GLYPH[k.ascendant.sign]} />
                <Chip label="Moon sign" value={k.moonSign} glyph={SIGN_GLYPH[k.moonSign]} />
                <Chip label="Sun sign" value={k.sunSign} glyph={SIGN_GLYPH[k.sunSign]} />
                <Chip label="Nakshatra" value={moon ? `${moon.nakshatra} · ${moon.pada}` : null} />
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8 flex gap-1 overflow-x-auto rounded-full border border-line-2 bg-white/5 p-1" role="tablist">
              {TABS.map((t) => (
                <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                  className={cn('relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition', tab === t.id ? 'text-cosmos-950' : 'text-ink-2 hover:text-ink-1')}>
                  {tab === t.id && <motion.span layoutId="kundliTab" className="absolute inset-0 rounded-full bg-gold-grad" transition={{ type: 'spring', damping: 26, stiffness: 300 }} />}
                  <span className="relative">{t.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="mt-6">
                {tab === 'chart' && (
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                    <div className="glass rounded-[2rem] p-4 sm:p-6">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-bold uppercase tracking-[.16em] text-gold">Rasi chart · D1</p>
                        <p className="text-xs text-ink-3">Tap a house</p>
                      </div>
                      <NorthIndianChart houses={k.houses} planets={k.planets} selected={selected} onSelect={setSelected} />
                      <p className="mt-3 text-center text-xs text-ink-3">North-Indian style · numbers are signs (1 Aries … 12 Pisces) · ℞ retrograde</p>
                    </div>
                    <div className="space-y-4">
                      <HouseDetail house={k.houses[selected - 1]} planets={k.planets} />
                      <Link href="/chat/va" className="flex items-center gap-3 rounded-3xl border border-gold/30 bg-gold/10 p-4 text-sm transition hover:border-gold/60">
                        <MessageCircle size={18} className="shrink-0 text-gold" />
                        <span className="flex-1">Ask {guide.name} what your {k.houses[selected - 1]?.sign} {ordinal(selected)} house means for you</span>
                      </Link>
                    </div>
                  </div>
                )}

                {tab === 'planets' && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {k.planets.map((p, i) => (
                      <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-3xl p-5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-11 w-11 place-items-center rounded-full text-sm font-black text-cosmos-950" style={{ background: PLANET_COLOR[p.name] }}>{p.name.slice(0, 2)}</span>
                          <div>
                            <p className="font-bold">{p.name} <span className="text-sm font-normal text-ink-3">{PLANET_HINDI[p.name]}</span></p>
                            <p className="text-sm text-ink-2">{SIGN_GLYPH[p.sign]} {p.sign} {fmtDegree(p.degree)}</p>
                          </div>
                          {p.retrograde && <span className="ml-auto rounded-full bg-cosmos-400/20 px-2 py-0.5 text-[11px] font-bold text-cosmos-200">℞ Retro</span>}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                          <p className="rounded-2xl bg-white/5 px-3 py-2"><span className="block text-[11px] text-ink-3">House</span>{ordinal(p.house)}</p>
                          <p className="rounded-2xl bg-white/5 px-3 py-2"><span className="block text-[11px] text-ink-3">Nakshatra</span>{p.nakshatra} {p.pada}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {tab === 'houses' && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {k.houses.map((hs) => (
                      <button key={hs.house} type="button" onClick={() => { setSelected(hs.house); setTab('chart') }}
                        className="glass rounded-3xl p-5 text-left transition hover:-translate-y-0.5 hover:border-gold/50">
                        <div className="flex items-center justify-between">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 font-black text-gold">{hs.house}</span>
                          <span className="text-sm font-semibold text-ink-2">{SIGN_GLYPH[hs.sign]} {hs.sign}</span>
                        </div>
                        <p className="mt-3 font-bold">{hs.name || `${ordinal(hs.house)} house`}</p>
                        <p className="text-sm text-ink-2">{hs.represents || HOUSE_THEME[hs.house - 1]}</p>
                        <p className="mt-3 text-xs text-ink-3">Lord {hs.lord}{hs.planets.length ? ` · ${hs.planets.join(', ')}` : ' · empty'}</p>
                      </button>
                    ))}
                  </div>
                )}

                {tab === 'dasha' && (k.dasha.timeline.length ? <DashaTimeline dasha={k.dasha} /> : <p className="text-ink-2">Dasha data is not available yet.</p>)}

                {tab === 'yogas' && (
                  k.yogas.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {k.yogas.map((y, i) => (
                        <motion.div key={y.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-3xl p-5">
                          <div className="flex items-start justify-between gap-3">
                            <p className="inline-flex items-center gap-2 font-bold text-gold-soft"><Sparkles size={16} /> {y.name}</p>
                            {y.strength && <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-ink-2">{y.strength}</span>}
                          </div>
                          {y.description && <p className="mt-2 text-sm leading-relaxed text-ink-2">{y.description}</p>}
                          {y.planets?.length > 0 && <p className="mt-3 text-xs text-ink-3">Formed by {y.planets.join(', ')}</p>}
                        </motion.div>
                      ))}
                    </div>
                  ) : <p className="text-ink-2">No major yogas were found in your chart.</p>
                )}

                {tab === 'report' && <KundliPdf name={k.name} />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  )
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
}
