import { redirect } from 'next/navigation'
import { loadSession } from '@/lib/server/session'
import { safeNext } from '@/lib/safeNext'
import LoginForm from '@/components/auth/LoginForm'
import GuidePair from '@/components/auth/GuidePair'

export const metadata = { title: 'Sign in', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }) {
  const next = safeNext(searchParams?.next)
  const session = await loadSession()
  // onboarded null = backend unreachable: go on to the page, which shows a retry message
  if (session) redirect(session.onboarded === false ? `/onboarding?next=${encodeURIComponent(next)}` : next)

  return (
    <section className="py-12 sm:py-20">
      <div className="wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <GuidePair />
        <LoginForm next={next} />
      </div>
    </section>
  )
}
