import { loadSession } from '@/lib/server/session'
import { guideByKey } from '@/lib/guides'
import GuideWelcome from '@/components/app/GuideWelcome'

export const metadata = { title: 'Your guide', robots: { index: false } }

// First screen after login. Phase 3 turns this into the live chat with the guide.
export default async function GuidePage() {
  const session = await loadSession()
  return <GuideWelcome guide={guideByKey(session.guide)} firstName={session.name.split(' ')[0]} />
}
