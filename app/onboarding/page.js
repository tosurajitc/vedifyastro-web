import { redirect } from 'next/navigation'
import { loadSession } from '@/lib/server/session'
import { safeNext } from '@/lib/safeNext'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export const metadata = { title: 'Your birth details', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function OnboardingPage({ searchParams }) {
  const next = safeNext(searchParams?.next)
  const session = await loadSession()
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`)
  if (session.onboarded) redirect(next)

  return (
    <section className="py-10 sm:py-16">
      <div className="wrap max-w-3xl">
        <OnboardingFlow next={next} initialName={session.name !== 'User' ? session.name : ''} initialEmail={session.email || ''} />
      </div>
    </section>
  )
}
