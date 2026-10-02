'use client'

import { useEffect, useRef } from 'react'

// Six boxes that behave like one field: auto-advance, backspace to previous, paste a full code
export default function OtpInput({ value, onChange, onComplete, disabled }) {
  const refs = useRef([])
  const chars = value.padEnd(6, ' ').split('').slice(0, 6)

  useEffect(() => { refs.current[0]?.focus() }, [])

  function setAt(i, ch) {
    const next = chars.map((c, j) => (j === i ? ch : c)).join('').replace(/\s+$/, '')
    onChange(next)
    if (ch && i < 5) refs.current[i + 1]?.focus()
    if (/^\d{6}$/.test(next)) onComplete?.(next)
  }

  function onPaste(e) {
    const code = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!code) return
    e.preventDefault()
    onChange(code)
    refs.current[Math.min(code.length, 5)]?.focus()
    if (code.length === 6) onComplete?.(code)
  }

  return (
    <div className="mt-4 flex justify-between gap-2" onPaste={onPaste}>
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          maxLength={1}
          disabled={disabled}
          value={c.trim()}
          onChange={(e) => setAt(i, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !c.trim() && i > 0) refs.current[i - 1]?.focus()
          }}
          className="h-14 w-full min-w-0 rounded-xl border border-line-2 bg-white/5 text-center text-2xl font-bold text-ink-1 transition focus:border-gold focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
        />
      ))}
    </div>
  )
}
