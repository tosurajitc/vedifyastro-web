import { NextResponse } from 'next/server'
import { clearSessionCookies } from '@/lib/server/session'

// The backend's logout is a no-op (JWTs are stateless), so dropping the cookies is the logout
export async function POST() {
  const response = NextResponse.json({ success: true })
  clearSessionCookies(response.cookies)
  return response
}
