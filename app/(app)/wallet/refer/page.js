import { loadSession } from '@/lib/server/session'
import ReferView from '@/components/wallet/ReferView'

export const metadata = { title: 'Refer & earn', robots: { index: false } }

export default async function ReferPage() {
  const session = await loadSession()
  return <ReferView firstName={session.name.split(' ')[0]} />
}
