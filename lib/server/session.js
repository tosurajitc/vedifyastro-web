import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'
import { backendJson } from './backend'

// The backend JWT lives in an httpOnly cookie so page scripts can never read it. The proxy turns it
// into an Authorization header. The refresh token (7 days) renews it; see middleware.js.
export const ACCESS_COOKIE = 'va_at'
export const REFRESH_COOKIE = 'va_rt'

const base = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' }

function secondsUntilExpiry(token, fallback) {
  try {
    const { exp } = jwtDecode(token)
    if (exp) return Math.max(60, exp - Math.floor(Date.now() / 1000))
  } catch {}
  return fallback
}

// va_in is a readable hint (no token in it) so the header knows to fetch the session
export const HINT_COOKIE = 'va_in'

// Works on any object with a Next cookies API: cookies() in route handlers, or response.cookies
export function writeSessionCookies(jar, { token, refreshToken }) {
  jar.set(HINT_COOKIE, '1', { ...base, httpOnly: false, maxAge: 7 * 24 * 3600 })
  if (token) jar.set(ACCESS_COOKIE, token, { ...base, maxAge: secondsUntilExpiry(token, 24 * 3600) })
  if (refreshToken) jar.set(REFRESH_COOKIE, refreshToken, { ...base, maxAge: secondsUntilExpiry(refreshToken, 7 * 24 * 3600) })
}

export function clearSessionCookies(jar) {
  jar.set(ACCESS_COOKIE, '', { ...base, maxAge: 0 })
  jar.set(REFRESH_COOKIE, '', { ...base, maxAge: 0 })
  jar.set(HINT_COOKIE, '', { ...base, httpOnly: false, maxAge: 0 })
}

export function getAccessToken() {
  return cookies().get(ACCESS_COOKIE)?.value || null
}

// The welcome guide is the opposite gender of the user: Savitri for men, Satyaban for women
export function guideFor(gender) {
  return gender === 'female' ? 'satyaban' : 'savitri'
}

// What the app needs to know about the signed-in user. Returns null when logged out.
// cache() shares one result between the layout and page of a single request.
export const loadSession = cache(async function loadSession() {
  const token = getAccessToken()
  if (!token) return null

  const [me, status] = await Promise.all([backendJson('/auth/me', { token }), backendJson('/birth-details/status', { token })])
  if (me.status === 401) return null

  const onboarded = !!(status.data?.data?.exists && status.data?.data?.hasCompleteData)
  let gender = null
  if (onboarded) {
    const bd = await backendJson('/birth-details', { token })
    gender = bd.data?.data?.gender || null
  }

  const user = me.data?.data || {}
  return {
    name: status.data?.data?.name || user.name || 'User',
    email: user.email && !user.email.endsWith('@vedifyastro.app') ? user.email : null,
    phone: user.phone || null,
    onboarded,
    gender,
    guide: guideFor(gender),
  }
})
