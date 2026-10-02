import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AGENTS } from '@/lib/agents'
import { loadSession } from '@/lib/server/session'
import { guideByKey } from '@/lib/guides'

export const metadata = { robots: { index: false } }

// Specialist chats arrive in Phase 6. Until then the landing page's agent links land here, not on a 404.
export default async function SpecialistComingSoon({ params }) {
  const agent = AGENTS.find((a) => a.key === params.key)
  if (!agent) notFound()
  const guide = guideByKey((await loadSession()).guide)

  return (
    <section className="py-16 sm:py-24">
      <div className="wrap max-w-xl text-center">
        <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-full ring-2 ring-gold/50">
          <Image src={agent.avatar} alt={agent.name} fill sizes="128px" className="object-cover" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-black tracking-tight">{agent.name} is joining the website soon</h1>
        <p className="mt-3 text-ink-2">{agent.title}. Meanwhile {guide.name} can answer from your chart, or you can chat with {agent.name} in the VedifyAstro app.</p>
        <Link href="/chat/va" className="mt-8 inline-flex rounded-full bg-gold-grad px-6 py-3.5 font-bold text-cosmos-950 shadow-glow-gold transition hover:brightness-110">
          Talk to {guide.name}
        </Link>
      </div>
    </section>
  )
}
