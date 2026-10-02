'use client'

import { motion } from 'framer-motion'
import { PLANET_ABBR } from '@/lib/kundli'
import { PLANET_COLOR } from '@/lib/dashboard'

// Standard North-Indian (diamond) chart: house 1 is the top-centre diamond and houses run
// counter-clockwise. Each house shows its sign number and the planets in it (whole-sign).
const S = 400
const h = S / 2, q = S / 4, t = (3 * S) / 4
const C = [h, h]

// Polygons per house (1–12) and the vertex nearest the chart centre (where the sign number goes)
const HOUSES = [
  { pts: [[h, 0], [t, q], C, [q, q]], inner: C },          // 1  top diamond
  { pts: [[0, 0], [h, 0], [q, q]], inner: [q, q] },        // 2  top-left
  { pts: [[0, 0], [q, q], [0, h]], inner: [q, q] },        // 3  left-top
  { pts: [[0, h], [q, q], C, [q, t]], inner: C },          // 4  left diamond
  { pts: [[0, h], [q, t], [0, S]], inner: [q, t] },        // 5  left-bottom
  { pts: [[0, S], [q, t], [h, S]], inner: [q, t] },        // 6  bottom-left
  { pts: [[h, S], [q, t], C, [t, t]], inner: C },          // 7  bottom diamond
  { pts: [[h, S], [t, t], [S, S]], inner: [t, t] },        // 8  bottom-right
  { pts: [[S, S], [t, t], [S, h]], inner: [t, t] },        // 9  right-bottom
  { pts: [[S, h], [t, t], C, [t, q]], inner: C },          // 10 right diamond
  { pts: [[S, h], [t, q], [S, 0]], inner: [t, q] },        // 11 right-top
  { pts: [[S, 0], [t, q], [h, 0]], inner: [t, q] },        // 12 top-right
]

const centroid = (pts) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length]
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]

const LINES = [
  `M0 0 H${S} V${S} H0 Z`,           // frame
  `M0 0 L${S} ${S} M${S} 0 L0 ${S}`,  // diagonals
  `M${h} 0 L${S} ${h} L${h} ${S} L0 ${h} Z`, // inner diamond
]

export default function NorthIndianChart({ houses, planets, selected, onSelect, title = 'Rasi (D1)' }) {
  const byHouse = (n) => planets.filter((p) => p.house === n)

  return (
    <svg viewBox={`-6 -6 ${S + 12} ${S + 12}`} className="w-full select-none" role="img" aria-label={`${title} chart`}>
      <defs>
        <radialGradient id="chartBg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="rgba(108,63,181,.35)" />
          <stop offset="100%" stopColor="rgba(13,0,40,.2)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width={S} height={S} fill="url(#chartBg)" rx="6" />

      {HOUSES.map((house, i) => {
        const n = i + 1
        const info = houses[i]
        const isSel = selected === n
        const c = centroid(house.pts)
        const numAt = lerp(c, house.inner, 0.62)
        const list = byHouse(n)
        const kite = house.pts.length === 4
        const lineH = 15
        const startY = c[1] - ((list.length + (n === 1 ? 1 : 0) - 1) * lineH) / 2 - (kite ? 4 : 0)
        return (
          <motion.g key={n} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.05 }}
            onClick={() => onSelect?.(n)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.(n)}
            role="button" tabIndex={0} aria-pressed={isSel} aria-label={`House ${n}, ${info?.sign}${list.length ? `, ${list.map((p) => p.name).join(', ')}` : ', empty'}`}
            className="cursor-pointer outline-none">
            <polygon points={house.pts.map((p) => p.join(',')).join(' ')}
              fill={isSel ? 'rgba(245,158,11,.18)' : 'transparent'} className="transition-[fill] duration-200 hover:fill-[rgba(245,158,11,.10)]" />
            <text x={numAt[0]} y={numAt[1]} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800"
              fill={isSel ? '#fbbf24' : 'rgba(201,168,76,.85)'}>{info?.signNum}</text>
            {n === 1 && (
              <text x={c[0]} y={startY} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="800" fill="#f59e0b">Asc</text>
            )}
            {list.map((p, j) => (
              <text key={p.name} x={c[0]} y={startY + (j + (n === 1 ? 1 : 0)) * lineH} textAnchor="middle" dominantBaseline="middle"
                fontSize="13.5" fontWeight="700" fill={PLANET_COLOR[p.name] || '#F0EAFF'}>
                {PLANET_ABBR[p.name]}{p.retrograde ? <tspan fontSize="9" dy="-4">℞</tspan> : null}
                <tspan fontSize="9" fill="rgba(240,234,255,.55)" dy={p.retrograde ? 4 : 0}> {Math.floor(p.degree)}°</tspan>
              </text>
            ))}
          </motion.g>
        )
      })}

      {LINES.map((d, i) => (
        <motion.path key={i} d={d} fill="none" stroke="rgba(245,158,11,.55)" strokeWidth="1.6" strokeLinejoin="round" pointerEvents="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: i * 0.15, ease: 'easeInOut' }} />
      ))}
    </svg>
  )
}
