import Link from 'next/link'
import { ArrowRight, Smartphone } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import siteConfig from '@/site.config'

export default function ClosingCTA() {
  return (
    <section className="py-20">
      <div className="wrap">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-cosmos-600 via-cosmos-700 to-cosmos-900 p-8 text-center shadow-glow sm:p-14">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-rose/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-black tracking-tight md:text-5xl">
              Your chart is already written. <span className="text-gold-grad">Start reading it.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-2">Free kundli in under a minute. Speak to an AI astrologer whenever you need clarity.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/login?next=/dashboard" className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold-grad px-7 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110">
                Get my free kundli <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
              </Link>
              <a href={siteConfig.brand.playStore} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-semibold transition hover:bg-white/10">
                <Smartphone size={18} /> Get the Android app
              </a>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-ink-2">
              {siteConfig.languages.map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
