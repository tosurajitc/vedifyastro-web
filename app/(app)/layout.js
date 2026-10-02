import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { loadSession } from '@/lib/server/session'
import BackendBusy from '@/components/app/BackendBusy'

export const dynamic = 'force-dynamic'

// Every page in (app) needs a signed-in user who has finished onboarding
export default async function AppLayout({ children }) {
  const session = await loadSession()
  const here = headers().get('x-pathname') || '/chat/va'
  if (!session) redirect(`/login?next=${encodeURIComponent(here)}`)
  // null = the backend couldn't be reached; don't send an onboarded user back to onboarding
  if (session.onboarded === null) return <BackendBusy />
  if (!session.onboarded) redirect(`/onboarding?next=${encodeURIComponent(here)}`)
  return children
}
