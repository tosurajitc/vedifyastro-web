import { NextResponse } from 'next/server'
import { loadSession } from '@/lib/server/session'

export const dynamic = 'force-dynamic'

// GET — who is signed in (used by the header). { user: null } when logged out. Birth data stays on the server.
export async function GET() {
  const session = await loadSession()
  if (!session) return NextResponse.json({ user: null })
  const { birth, ...user } = session
  return NextResponse.json({ user })
}
