'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

// Shared primary button for the steps
export function NextButton({ children = 'Continue', busy, disabled, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-gold-grad px-6 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110 disabled:opacity-50 disabled:shadow-none sm:w-auto sm:min-w-[200px]"
    >
      {busy ? <Loader2 size={18} className="animate-spin" /> : null}
      {children}
      {!busy && <ArrowRight size={18} className="transition group-hover:translate-x-1" />}
    </button>
  )
}

// Pill-style single choice
export function ChoiceGroup({ label, options, value, onChange, columns = 'grid-cols-3' }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink-2">{label}</legend>
      <div className={cn('mt-2 grid gap-2', columns)}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn('rounded-2xl border px-3 py-3 text-sm font-semibold transition',
              value === o.value ? 'border-gold bg-gold/15 text-gold-soft' : 'border-line-2 bg-white/5 text-ink-2 hover:border-gold/40 hover:text-ink-1')}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export const inputClass =
  'mt-2 w-full rounded-2xl border border-line-2 bg-white/5 px-4 py-3.5 text-ink-1 placeholder:text-ink-3 focus:border-gold/60 focus:ring-2 focus:ring-gold/20 [color-scheme:dark]'
