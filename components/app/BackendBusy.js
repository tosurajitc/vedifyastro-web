'use client'

import { useRouter } from 'next/navigation'
import { RotateCcw } from 'lucide-react'

// Shown when the backend is unreachable or rate-limiting, instead of logging the user out
export default function BackendBusy() {
  const router = useRouter()
  return (
    <section className="py-24">
      <div className="wrap max-w-md text-center">
        <p className="text-5xl" aria-hidden="true">🪐</p>
        <h1 className="mt-4 font-display text-2xl font-black">The stars are a little busy</h1>
        <p className="mt-2 text-ink-2">We couldn’t reach VedifyAstro’s servers just now. You’re still signed in — please try again in a moment.</p>
        <button type="button" onClick={() => router.refresh()} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-grad px-6 py-3 font-bold text-cosmos-950 shadow-glow-gold">
          <RotateCcw size={16} /> Try again
        </button>
      </div>
    </section>
  )
}
