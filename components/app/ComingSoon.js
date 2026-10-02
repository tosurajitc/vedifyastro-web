import Image from 'next/image'
import Link from 'next/link'
import { loadSession } from '@/lib/server/session'
import { guideByKey } from '@/lib/guides'

// Holding page for app sections that later phases build (wallet, kundli, horoscopes, reports).
// Links from the chat land here instead of a 404.
export default async function ComingSoon({ title, text, phase }) {
  const guide = guideByKey((await loadSession()).guide)
  return (
    <section className="py-16 sm:py-24">
      <div className="wrap max-w-xl text-center">
        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full ring-2 ring-gold/50">
          <Image src={guide.avatar} alt="" fill sizes="112px" className="object-cover" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-gold">Coming to the website{phase ? ` · ${phase}` : ''}</p>
        <h1 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-ink-2">{text} Until then you can use it in the VedifyAstro app, or ask {guide.name}.</p>
        <Link href="/chat/va" className="mt-8 inline-flex rounded-full bg-gold-grad px-6 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110">
          Back to {guide.name}
        </Link>
      </div>
    </section>
  )
}
