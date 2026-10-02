import { NextResponse } from 'next/server'
import { backendJson, clientIp } from '@/lib/server/backend'
import { writeSessionCookies } from '@/lib/server/session'

// Shared by the Google and phone login routes: call the backend, keep the tokens in cookies,
// and send the browser only what it needs.
export async function completeLogin(req, backendPath, body) {
  const res = await backendJson(backendPath, { method: 'POST', body, ip: clientIp(req.headers) })
  const payload = res.data?.data
  if (!res.ok || !res.data?.success || !payload?.token) {
    const message = res.data?.message || res.data?.error?.message || 'Login failed. Please try again.'
    return NextResponse.json({ success: false, message }, { status: res.status >= 400 ? res.status : 400 })
  }

  const status = await backendJson('/birth-details/status', { token: payload.token })
  const onboarded = !!(status.data?.data?.exists && status.data?.data?.hasCompleteData)

  const response = NextResponse.json({ success: true, onboarded })
  writeSessionCookies(response.cookies, { token: payload.token, refreshToken: payload.refreshToken })
  return response
}
