import { loadSession } from '@/lib/server/session'
import { guideByKey } from '@/lib/guides'
import Dashboard from '@/components/dashboard/Dashboard'

export const metadata = { title: 'Today', robots: { index: false } }

export default async function DashboardPage() {
  const session = await loadSession()
  const birth = session.birth || {}
  return (
    <Dashboard
      firstName={(birth.name || session.name).split(' ')[0]}
      guide={guideByKey(session.guide)}
      // Panchang times are calculated for the birth location (as in the app)
      place={(birth.birth_place || '').split(',')[0] || null}
    />
  )
}
