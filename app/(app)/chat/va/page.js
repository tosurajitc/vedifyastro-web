import { loadSession, getAccessToken } from '@/lib/server/session'
import { backendJson } from '@/lib/server/backend'
import { guideByKey } from '@/lib/guides'
import { vaGreeting } from '@/lib/vaGreeting'
import VAChat from '@/components/chat/VAChat'

export const metadata = { title: 'Ask your guide', robots: { index: false } }

// First screen after login: chat with Savitri or Satyaban (Ask VA)
export default async function GuideChatPage() {
  const session = await loadSession()
  const birth = session.birth || {}
  const guide = guideByKey(session.guide)
  const firstName = (birth.name || session.name).split(' ')[0]

  // As in the app: if the kundli hasn't been calculated yet, start it now (not awaited)
  if (birth.birth_date && birth.birth_time && birth.birth_place && !birth.ascendant) {
    backendJson('/kundli/generate', {
      method: 'POST',
      token: getAccessToken(),
      timeoutMs: 60_000,
      body: {
        name: birth.name, birth_date: birth.birth_date, birth_time: birth.birth_time, birth_place: birth.birth_place,
        latitude: birth.latitude, longitude: birth.longitude, timezone: birth.timezone || 5.5,
      },
    }).catch(() => {})
  }

  const greeting = vaGreeting({ language: session.language, guide: guide.key, firstName, maritalStatus: birth.marital_status, birthDate: birth.birth_date })
  return <VAChat guide={guide} greeting={greeting} language={session.language} />
}
