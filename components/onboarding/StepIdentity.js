'use client'

import { GENDERS, MARITAL } from '@/lib/onboarding'
import { ChoiceGroup, NextButton, inputClass } from './ui'

export default function StepIdentity({ data, update, onNext, setError }) {
  function next(e) {
    e.preventDefault()
    if (data.name.trim().length < 2) return setError('Please enter your name.')
    if (!data.gender) return setError('Please choose your gender.')
    if (!data.marital_status) return setError('Please choose your marital status.')
    onNext()
  }

  return (
    <form onSubmit={next}>
      <h2 className="font-display text-2xl font-black tracking-tight">About you</h2>
      <p className="mt-1 text-sm text-ink-2">Your guide uses this to speak to you personally.</p>

      <label htmlFor="name" className="mt-6 block text-sm font-semibold text-ink-2">Full name</label>
      <input id="name" autoComplete="name" value={data.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Ananya Sharma" className={inputClass} maxLength={80} />

      <div className="mt-6">
        <ChoiceGroup label="Gender" options={GENDERS} value={data.gender} onChange={(gender) => update({ gender })} />
      </div>
      <div className="mt-6">
        <ChoiceGroup label="Marital status" options={MARITAL} value={data.marital_status} onChange={(marital_status) => update({ marital_status })} columns="grid-cols-2 sm:grid-cols-3" />
      </div>

      <NextButton type="submit" />
    </form>
  )
}
