'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { clockToMinutes, rangeToMinutes } from '@/lib/dashboard'

// The day as an arc from sunrise to sunset: Rahu Kaal in red, Abhijit muhurat in green,
// and the sun at the current time (browser clock) while it is daytime.
const W = 320, H = 150, CX = W / 2, CY = 140, RX = 140, RY = 118

const pointAt = (t) => {
  // t: 0 at sunrise (left) → 1 at sunset (right)
  const a = Math.PI * (1 - t)
  return [CX + RX * Math.cos(a), CY - RY * Math.sin(a)]
}

function arcPath(t0, t1) {
  const [x0, y0] = pointAt(t0)
  const [x1, y1] = pointAt(t1)
  return `M ${x0} ${y0} A ${RX} ${RY} 0 0 1 ${x1} ${y1}`
}

export default function SunArc({ sunrise, sunset, rahuKaal, abhijit }) {
  const rise = clockToMinutes(sunrise)
  const set = clockToMinutes(sunset)
  const [now, setNow] = useState(null)

  useEffect(() => {
    const tick = () => { const d = new Date(); setNow(d.getHours() * 60 + d.getMinutes()) }
    tick()
    const t = setInterval(tick, 60_000)
    return () => clearInterval(t)
  }, [])

  if (rise == null || set == null || set <= rise) return null
  const frac = (m) => Math.max(0, Math.min(1, (m - rise) / (set - rise)))
  const rahu = rangeToMinutes(rahuKaal)
  const abh = rangeToMinutes(abhijit)
  const sunT = now != null && now >= rise && now <= set ? frac(now) : null
  const [sx, sy] = sunT != null ? pointAt(sunT) : []

  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" role="img" aria-label={`Sunrise ${sunrise}, sunset ${sunset}`}>
      <defs>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <line x1="8" y1={CY} x2={W - 8} y2={CY} stroke="rgba(182,127,245,.35)" strokeDasharray="3 5" />
      <motion.path d={arcPath(0, 1)} fill="none" stroke="rgba(245,158,11,.35)" strokeWidth="2" strokeDasharray="2 6"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
      {rahu && <path d={arcPath(frac(rahu[0]), frac(rahu[1]))} fill="none" stroke="#FF6B6B" strokeWidth="6" strokeLinecap="round" />}
      {abh && <path d={arcPath(frac(abh[0]), frac(abh[1]))} fill="none" stroke="#4ADE80" strokeWidth="6" strokeLinecap="round" />}
      {sunT != null && (
        <g>
          <circle cx={sx} cy={sy} r="16" fill="url(#sunGlow)" opacity=".7">
            <animate attributeName="r" values="14;18;14" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={sx} cy={sy} r="6.5" fill="#fbbf24" />
        </g>
      )}
      <text x="12" y={H + 14} fill="#9d8ec0" fontSize="11">↑ {sunrise}</text>
      <text x={W - 12} y={H + 14} fill="#9d8ec0" fontSize="11" textAnchor="end">{sunset} ↓</text>
    </svg>
  )
}
