import { NextResponse } from 'next/server'
import { completeLogin } from '../_login'

// POST { accessToken, name?, picture?, referredBy? } — the Google access token from the sign-in popup.
// The backend verifies it against Google and checks it was issued to our web client ID.
export async function POST(req) {
  const { accessToken, name, picture, referredBy } = await req.json().catch(() => ({}))
  if (!accessToken) return NextResponse.json({ success: false, message: 'Google sign-in was cancelled.' }, { status: 400 })
  return completeLogin(req, '/auth/google', { accessToken, name, picture, referred_by: referredBy || undefined })
}
