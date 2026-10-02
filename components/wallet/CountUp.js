'use client'

import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

// Number that rolls from its previous value to the new one
export default function CountUp({ value, duration = 1.2, format = (n) => Math.round(n).toLocaleString('en-IN') }) {
  const [shown, setShown] = useState(value ?? 0)
  const from = useRef(value ?? 0)

  useEffect(() => {
    if (value == null) return
    const controls = animate(from.current, value, { duration, ease: 'easeOut', onUpdate: setShown })
    from.current = value
    return () => controls.stop()
  }, [value, duration])

  return <span className="tabular-nums">{format(shown)}</span>
}
