import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { loadSession } from '@/lib/server/session'

export const dynamic = 'force-dynamic'

// Every page in (app) needs a signed-in user who has finished onboarding
export default async function AppLayout({ children }) {
  const session = await loadSession()
  const here = headers().get('x-pathname') || '/chat/va'
  if (!session) redirect(`/login?next=${encodeURIComponent(here)}`)
  if (!session.onboarded) redirect(`/onboarding?next=${encodeURIComponent(here)}`)
  return children
}
