import { NextResponse } from 'next/server'
import { loadSession } from '@/lib/server/session'

export const dynamic = 'force-dynamic'

// GET — who is signed in (used by the header). { user: null } when logged out.
export async function GET() {
  const user = await loadSession()
  return NextResponse.json({ user })
}
