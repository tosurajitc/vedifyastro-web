'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SIGNS, ELEMENT_COLOR } from '@/lib/zodiac'

const SIZE = 440
const C = SIZE / 2
const R_OUT = 205
const R_IN = 150
const R_GLYPH = (R_OUT + R_IN) / 2

// Glyphs get U+FE0E (text presentation) so Windows doesn't render them as emoji boxes
const TEXT_STYLE = String.fromCharCode(0xfe0e)

// Point on a circle; angle 0 = top, clockwise
const pt = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}

function segmentPath(i) {
  const a0 = i * 30
  const a1 = a0 + 30
  const [x0, y0] = pt(R_OUT, a0)
  const [x1, y1] = pt(R_OUT, a1)
  const [x2, y2] = pt(R_IN, a1)
  const [x3, y3] = pt(R_IN, a0)
  return `M${x0},${y0} A${R_OUT},${R_OUT} 0 0 1 ${x1},${y1} L${x2},${y2} A${R_IN},${R_IN} 0 0 0 ${x3},${y3} Z`
}

// Decorative planets orbiting inside the wheel
const ORBITS = [
  { r: 118, size: 7, color: '#fbbf24', dur: 38, label: 'Sun' },
  { r: 96, size: 5, color: '#e0c8ff', dur: 18, label: 'Moon' },
  { r: 74, size: 5, color: '#ef4444', dur: 52, label: 'Mars' },
  { r: 54, size: 6, color: '#f59e0b', dur: 80, label: 'Jupiter' },
]

export default function ZodiacWheel({ className = '' }) {
  const [active, setActive] = useState(null)
  const sign = active !== null ? SIGNS[active] : null

  return (
    <div className={`relative aspect-square w-full max-w-[440px] ${className}`}>
      {/* glow */}
      <div className="absolute inset-[12%] rounded-full bg-cosmos-400/20 blur-3xl" aria-hidden="true" />

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative h-full w-full" role="img" aria-label="Interactive zodiac wheel">
        <defs>
          <radialGradient id="wheelCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b0080" stopOpacity=".9" />
            <stop offset="100%" stopColor="#0d0028" stopOpacity=".95" />
          </radialGradient>
        </defs>

        {/* Slowly rotating sign ring */}
        <g className="origin-center animate-spin-slow" style={{ transformOrigin: `${C}px ${C}px` }}>
          {SIGNS.map((s, i) => {
            const isActive = active === i
            const [gx, gy] = pt(R_GLYPH, i * 30 + 15)
            return (
              <g
                key={s.key}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                role="button"
                aria-label={`${s.name} (${s.rashi})`}
                className="cursor-pointer outline-none"
              >
                <path
                  d={segmentPath(i)}
                  fill={isActive ? ELEMENT_COLOR[s.element] : 'rgba(108,63,181,.16)'}
                  fillOpacity={isActive ? 0.35 : 1}
                  stroke="rgba(182,127,245,.45)"
                  strokeWidth="1"
                  style={{ transition: 'fill .25s, fill-opacity .25s' }}
                />
                <text
                  x={gx}
                  y={gy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="24"
                  fontFamily="'Segoe UI Symbol', 'Noto Sans Symbols', 'DejaVu Sans', sans-serif"
                  fill={isActive ? '#fde68a' : '#e0c8ff'}
                  style={{ transition: 'fill .25s' }}
                >
                  {s.glyph + TEXT_STYLE}
                </text>
              </g>
            )
          })}
        </g>

        {/* Core */}
        <circle cx={C} cy={C} r={R_IN - 6} fill="url(#wheelCore)" stroke="rgba(245,158,11,.35)" strokeWidth="1" />
        {ORBITS.map((o) => (
          <circle key={o.label} cx={C} cy={C} r={o.r} fill="none" stroke="rgba(182,127,245,.12)" strokeDasharray="2 5" />
        ))}
      </svg>

      {/* Orbiting planets (HTML so framer-motion can rotate them cheaply) */}
      {ORBITS.map((o) => {
        const pct = (o.r / SIZE) * 100 // orbit radius as % of the wheel
        return (
          <motion.div
            key={o.label}
            aria-hidden="true"
            className="absolute"
            style={{ width: `${pct * 2}%`, height: `${pct * 2}%`, left: `${50 - pct}%`, top: `${50 - pct}%` }}
            animate={{ rotate: 360 }}
            transition={{ duration: o.dur, repeat: Infinity, ease: 'linear' }}
          >
            <span
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ width: o.size, height: o.size, background: o.color, boxShadow: `0 0 10px ${o.color}` }}
            />
          </motion.div>
        )
      })}

      {/* Centre label */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div
          key={sign ? sign.key : 'default'}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center"
        >
          {sign ? (
            <>
              <div className="text-4xl leading-none text-gold-soft">{sign.glyph + TEXT_STYLE}</div>
              <div className="mt-2 font-display text-xl font-bold">{sign.rashi}</div>
              <div className="text-xs text-ink-2">{sign.name} · {sign.element} · ruled by {sign.ruler}</div>
            </>
          ) : (
            <>
              <div className="font-display text-sm font-semibold uppercase tracking-[.25em] text-gold">Your chart</div>
              <div className="mt-1 text-xs text-ink-2">Hover a sign</div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
