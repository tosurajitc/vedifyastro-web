import { loadSession } from '@/lib/server/session'
import { guideByKey } from '@/lib/guides'
import KundliView from '@/components/kundli/KundliView'

export const metadata = { title: 'My kundli', robots: { index: false } }

export default async function KundliPage() {
  const session = await loadSession()
  return <KundliView guide={guideByKey(session.guide)} />
}
